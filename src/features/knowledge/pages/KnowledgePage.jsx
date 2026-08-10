import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/features/landing/components/Navbar";
import { BrandProfileCard } from "@/features/knowledge/components/BrandProfileCard";
import { KnowledgeAskPanel } from "@/features/knowledge/components/KnowledgeAskPanel";
import { KnowledgeHero } from "@/features/knowledge/components/KnowledgeHero";
import { KnowledgeSourcesList } from "@/features/knowledge/components/KnowledgeSourcesList";
import { SourceComposer } from "@/features/knowledge/components/SourceComposer";
import {
  addDocumentKnowledgeSource,
  addSocialKnowledgeSource,
  addWebsiteKnowledgeSource,
  askProjectKnowledge,
  deleteKnowledgeSource,
  listKnowledgeSources,
  listProjects,
  refreshKnowledgeSource,
  reindexProjectKnowledge,
  updateProjectBrandProfile,
} from "@/lib/campaignApi";

const emptyProfile = {
  voice: "",
  preferredTerms: "",
  prohibitedTerms: "",
  writingRules: "",
  ctaGuidance: "",
  languageGuidance: "",
};

const toLines = (value) => value.split(/\n+/).map((item) => item.trim()).filter(Boolean);

function profileFor(project) {
  const profile = project?.brandProfile;
  return {
    voice: profile?.voice ?? "",
    preferredTerms: (profile?.preferredTerms ?? []).join("\n"),
    prohibitedTerms: (profile?.prohibitedTerms ?? []).join("\n"),
    writingRules: (profile?.writingRules ?? []).join("\n"),
    ctaGuidance: profile?.ctaGuidance ?? "",
    languageGuidance: profile?.languageGuidance ?? "",
  };
}

export function KnowledgePage() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [sources, setSources] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const loadSources = useCallback(async (id) => {
    if (!id) {
      setSources([]);
      return;
    }
    setSources(await listKnowledgeSources(id));
  }, []);

  useEffect(() => {
    let active = true;

    const initialise = async () => {
      try {
        const items = await listProjects();
        if (!active) return;
        const firstProject = items[0];
        setProjects(items);
        setProjectId(firstProject?.id ?? "");
        setProfile(profileFor(firstProject));
        if (firstProject?.id) await loadSources(firstProject.id);
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void initialise();
    return () => { active = false; };
  }, [loadSources]);

  const execute = async (operation) => {
    if (!projectId || busy) return false;
    setBusy(true);
    setError("");
    try {
      await operation();
      await loadSources(projectId);
      return true;
    } catch (cause) {
      setError(cause.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const selectProject = async (id) => {
    if (busy || asking) return;
    const project = projects.find((item) => item.id === id);
    setProjectId(id);
    setProfile(profileFor(project));
    setChat([]);
    setError("");
    try {
      await loadSources(id);
    } catch (cause) {
      setError(cause.message);
    }
  };

  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    void execute(async () => {
      const brandProfile = {
        voice: profile.voice.trim(),
        preferredTerms: toLines(profile.preferredTerms),
        prohibitedTerms: toLines(profile.prohibitedTerms),
        writingRules: toLines(profile.writingRules),
        ...(profile.ctaGuidance.trim() ? { ctaGuidance: profile.ctaGuidance.trim() } : {}),
        ...(profile.languageGuidance.trim() ? { languageGuidance: profile.languageGuidance.trim() } : {}),
      };
      await updateProjectBrandProfile(projectId, brandProfile);
      setProjects((items) => items.map((project) => project.id === projectId ? { ...project, brandProfile } : project));
    });
  };

  const ask = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!projectId || !text || asking) return;
    setAsking(true);
    setError("");
    setQuestion("");
    try {
      const result = await askProjectKnowledge(projectId, text);
      setChat((items) => [...items, { question: text, ...result }]);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setAsking(false);
    }
  };

  const readyCount = useMemo(() => sources.filter((source) => source.status === "READY").length, [sources]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#fef7ff]"><Loader2 className="size-7 animate-spin text-[#4f378a]" /></div>;

  return (
    <div className="min-h-screen bg-[#fef7ff] text-[#1d1b20]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <KnowledgeHero projects={projects} projectId={projectId} onProjectChange={selectProject} sourceCount={sources.length} readyCount={readyCount} disabled={busy || asking} />

        {error ? <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}

        {!projectId ? <EmptyProjectState /> : (
          <>
            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-start">
              <SourceComposer
                busy={busy}
                onAddWebsite={(url) => execute(() => addWebsiteKnowledgeSource(projectId, { url }))}
                onAddDocument={(input) => execute(() => addDocumentKnowledgeSource(projectId, input))}
                onAddSocial={(input) => execute(() => addSocialKnowledgeSource(projectId, { platform: "instagram", ...input }))}
              />
              <BrandProfileCard value={profile} onChange={updateProfileField} onSave={saveProfile} busy={busy} />
            </div>

            <KnowledgeSourcesList
              sources={sources}
              busy={busy}
              onReindex={() => void execute(() => reindexProjectKnowledge(projectId))}
              onRefresh={(sourceId) => void execute(() => refreshKnowledgeSource(projectId, sourceId))}
              onDelete={(sourceId) => void execute(() => deleteKnowledgeSource(projectId, sourceId))}
            />

            <KnowledgeAskPanel chat={chat} question={question} onQuestionChange={setQuestion} onSubmit={ask} asking={asking} />
          </>
        )}
      </main>
    </div>
  );
}

function EmptyProjectState() {
  return <section className="mt-8 rounded-[24px] border border-dashed border-[#ccbfe0] bg-white px-5 py-12 text-center"><h2 className="text-xl font-bold text-[#312738]">Create a project to begin</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71677a]">Your knowledge base belongs to a project. Create one from Generate, then return here to add trusted material.</p></section>;
}
