import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Eye,
  ImageIcon,
  LockKeyhole,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  Unplug,
  XCircle,
} from "lucide-react";
import {
  cancelPublication,
  disconnectMeta,
  getMetaConnectorStatus,
  listCampaignContents,
  listChats,
  listProjects,
  listPublications,
  retryPublication,
  schedulePublication,
  selectMetaAccount,
  startMetaConnection,
  syncMetaConnection,
} from "@/lib/campaignApi";
import demoPostImage from "@/assets/hero-social-studio.webp";

const STATUS_STYLE = {
  QUEUED: "bg-sky-100 text-sky-800",
  SCHEDULED: "bg-violet-100 text-violet-800",
  PUBLISHING: "bg-amber-100 text-amber-900",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-slate-100 text-slate-700",
};

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#381e72] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(56,30,114,0.16)] transition-colors hover:bg-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:opacity-50";
const ICON_BUTTON_CLASS =
  "inline-flex size-11 items-center justify-center rounded-xl border border-[#d4c8dc] bg-white transition-colors hover:bg-[#f3ecf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:opacity-50";
const FIELD_CLASS =
  "min-h-11 w-full rounded-xl border border-[#cbbdde] bg-white px-3 text-sm text-[#2b2530] outline-none transition-shadow focus:border-[#70579e] focus:ring-2 focus:ring-[#70579e]/20 disabled:bg-[#f6f1f6] disabled:text-[#716878] disabled:opacity-100";

const DEMO_ACCOUNTS = [
  { id: "demo-facebook", name: "Jasper Studio", platform: "Facebook Page", username: "jasperstudio" },
  { id: "demo-instagram", name: "Jasper Creative", platform: "Instagram", username: "jasper.creative" },
];

function nextHourValue() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function getDemoPublications() {
  const fromNow = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();

  return [
    {
      id: "demo-scheduled",
      status: "SCHEDULED",
      platform: "Instagram",
      accountName: "@jasper.creative",
      title: "Summer launch carousel",
      caption: "A brighter campaign starts with one clear idea. Swipe through the story behind our summer collection.",
      scheduledFor: fromNow(120),
      mediaUrl: demoPostImage,
    },
    {
      id: "demo-published",
      status: "PUBLISHED",
      platform: "Facebook",
      accountName: "Jasper Studio",
      title: "Behind the campaign",
      caption: "Meet the team turning audience insight into a campaign built for meaningful action.",
      scheduledFor: fromNow(-180),
      mediaUrl: demoPostImage,
    },
    {
      id: "demo-failed",
      status: "FAILED",
      platform: "Instagram",
      accountName: "@jasper.creative",
      title: "Product spotlight reel",
      caption: "One product, three ways to make every day feel easier.",
      scheduledFor: fromNow(-25),
      error: "Sample provider error · Retry becomes available after connection.",
    },
  ];
}

function PreviewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cbbdde] bg-[#f5effb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#62458e]">
      <Eye className="size-3.5" />
      Sample data
    </span>
  );
}

function PublicationImage({ mediaUrl, title }) {
  const canRenderImage =
    typeof mediaUrl === "string" && /^(https:\/\/|data:image\/|blob:|\/)/i.test(mediaUrl);

  if (!canRenderImage) return null;

  return (
    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-[#ded7e3] bg-[#eee8f0] sm:w-32">
      <div className="absolute inset-0 grid place-items-center text-[#8b7b94]">
        <span className="flex flex-col items-center gap-1 text-[10px] font-medium">
          <ImageIcon className="size-4" />
          Media unavailable
        </span>
      </div>
      <img
        key={mediaUrl}
        src={mediaUrl}
        alt={`Post artwork for ${title}`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
        className="relative z-10 size-full object-cover"
      />
    </div>
  );
}

function MetaPublishingPreview() {
  const demoPublications = getDemoPublications();

  return (
    <div className="mt-7">
      <div className="flex items-start gap-3 rounded-2xl border border-[#cbbdde] bg-[#f5effb] p-4 text-[#4f378a]">
        <Eye className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-sm font-bold">Preview mode</p>
          <p className="mt-1 text-sm leading-6 text-[#625b71]">
            This sample workspace shows how your accounts, schedule form, and publication queue will look. Connect Meta to replace it with live data.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-7">
          <section className="rounded-2xl border border-[#ded7e3] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">Delivery accounts</h2>
                <p className="mt-1 text-xs text-[#726979]">Pages and professional accounts available to campaigns.</p>
              </div>
              <PreviewBadge />
            </div>
            <div className="mt-4 divide-y divide-[#eee8f0]">
              {DEMO_ACCOUNTS.map((account) => (
                <div key={account.id} className="flex items-center gap-3 py-3">
                  <input type="checkbox" checked disabled aria-label={`${account.name} selected`} className="size-4 accent-[#4f378a]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{account.name}</span>
                    <span className="block text-xs text-[#726979]">{account.platform} · @{account.username}</span>
                  </span>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#ded7e3] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">Schedule approved content</h2>
                <p className="mt-1 text-xs text-[#726979]">Choose a destination and delivery time after connecting.</p>
              </div>
              <LockKeyhole className="size-4 text-[#8b7b94]" aria-label="Connect Meta to unlock" />
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold">Project<select disabled className={`${FIELD_CLASS} mt-1`}><option>Summer product launch</option></select></label>
              <label className="block text-xs font-semibold">Campaign<select disabled className={`${FIELD_CLASS} mt-1`}><option>Build launch awareness</option></select></label>
              <label className="block text-xs font-semibold">Content<select disabled className={`${FIELD_CLASS} mt-1`}><option>Summer launch carousel</option></select></label>
              <label className="block text-xs font-semibold">Account<select disabled className={`${FIELD_CLASS} mt-1`}><option>Jasper Creative · Instagram</option></select></label>
              <label className="block text-xs font-semibold">Publish at<input type="datetime-local" disabled value={nextHourValue()} readOnly className={`${FIELD_CLASS} mt-1`} /></label>
            </div>
            <button type="button" disabled className={`${PRIMARY_BUTTON_CLASS} mt-4`}>
              <LockKeyhole className="mr-2 size-4" />
              Connect Meta to schedule
            </button>
          </section>
        </div>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Publication queue</h2>
              <p className="mt-1 text-xs text-[#726979]">Track delivery progress and recover failed posts.</p>
            </div>
            <select disabled className="min-h-10 rounded-xl border border-[#cbbdde] bg-white px-3 text-xs font-semibold text-[#625b71]"><option>All statuses</option></select>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#ded7e3] bg-white shadow-sm">
            {demoPublications.map((publication) => (
              <article key={publication.id} className="border-b border-[#eee8f0] p-5 last:border-0">
                <div className="flex flex-wrap items-start gap-3">
                  <PublicationImage mediaUrl={publication.mediaUrl} title={publication.title} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[publication.status]}`}>{publication.status.toLowerCase()}</span>
                      <span className="text-xs font-semibold text-[#4f378a]">{publication.platform.toLowerCase()} · {publication.accountName}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b7b94]">Sample</span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{publication.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#726979]">{publication.caption}</p>
                    <p className="mt-2 text-xs text-[#625b71]">{new Date(publication.scheduledFor).toLocaleString()}</p>
                    {publication.error ? <p className="mt-2 text-xs text-rose-700">{publication.error}</p> : null}
                  </div>
                  {publication.status === "PUBLISHED" ? <Send className="mt-2 size-4 text-emerald-600" /> : <LockKeyhole className="mt-2 size-4 text-[#9b8fa1]" />}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function MetaPublishingDashboard() {
  const [meta, setMeta] = useState(null);
  const [projects, setProjects] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [contents, setContents] = useState([]);
  const [publications, setPublications] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [contentId, setContentId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [scheduledFor, setScheduledFor] = useState(nextHourValue);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refreshPublications = useCallback(async (status = statusFilter) => {
    const result = await listPublications({ status: status || undefined });
    setPublications(result.items);
  }, [statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getMetaConnectorStatus({ signal: controller.signal }),
      listProjects({ signal: controller.signal }),
      listPublications({ signal: controller.signal }),
    ])
      .then(async ([connector, projectItems, publicationResult]) => {
        setMeta(connector);
        setProjects(projectItems);
        setPublications(publicationResult.items);
        const firstProject = projectItems[0]?.id ?? "";
        setProjectId(firstProject);
        if (!firstProject) return;
        const campaignItems = await listChats(firstProject, { signal: controller.signal });
        setCampaigns(campaignItems);
        setCampaignId(campaignItems[0]?.id ?? "");
      })
      .catch((cause) => cause?.name !== "AbortError" && setError(cause.message))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!campaignId) return undefined;
    const controller = new AbortController();
    void listCampaignContents(campaignId, { signal: controller.signal })
      .then((items) => {
        setContents(items);
        setContentId(items[0]?.id ?? "");
      })
      .catch((cause) => cause?.name !== "AbortError" && setError(cause.message));
    return () => controller.abort();
  }, [campaignId]);

  const selectedAccounts = useMemo(
    () => (meta?.connection?.accounts ?? []).filter((account) => account.selected && account.available),
    [meta],
  );
  const effectiveAccountId = selectedAccounts.some((account) => account.id === accountId)
    ? accountId
    : (selectedAccounts[0]?.id ?? "");

  const run = async (key, operation, successMessage) => {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      await operation();
      if (successMessage) setMessage(successMessage);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy("");
    }
  };

  const loadMeta = async () => setMeta(await getMetaConnectorStatus());

  const chooseProject = async (nextProjectId) => {
    setProjectId(nextProjectId);
    setCampaignId("");
    setContents([]);
    const items = await listChats(nextProjectId);
    setCampaigns(items);
    setCampaignId(items[0]?.id ?? "");
  };

  const connect = () => run("connect", async () => {
    const { authorizationUrl } = await startMetaConnection();
    window.location.assign(authorizationUrl);
  });

  const schedule = (event) => {
    event.preventDefault();
    void run("schedule", async () => {
      const isoTime = scheduledFor ? new Date(scheduledFor).toISOString() : undefined;
      await schedulePublication(contentId, effectiveAccountId, isoTime);
      await refreshPublications();
    }, "Publication added to the delivery queue.");
  };

  if (loading) return <section className="mx-auto grid min-h-80 max-w-[1280px] place-items-center px-6 pt-28"><Loader2 className="size-6 animate-spin text-[#4f378a]" /></section>;

  return (
    <section className="border-b border-[#ded7e3] bg-[#f8f3f8] px-6 pb-16 pt-28 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-5 border-b border-[#d8cedc] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#4f378a]">Publishing workspace</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.03em] text-[#201a25]">Schedule, watch, recover.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625b71]">Connect Meta accounts, choose approved campaign content, and manage every queued or delivered post from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!meta?.connection ? <button type="button" onClick={connect} disabled={!meta?.configured || busy === "connect"} className={PRIMARY_BUTTON_CLASS}>{busy === "connect" ? "Connecting…" : "Connect Meta"}</button> : <>
              <button type="button" onClick={() => void run("sync", async () => { await syncMetaConnection(); await loadMeta(); }, "Meta accounts refreshed.")} disabled={Boolean(busy)} className={PRIMARY_BUTTON_CLASS}><RefreshCw className="mr-2 inline size-4" />Sync accounts</button>
              <button type="button" onClick={() => void run("disconnect", async () => { await disconnectMeta(); await loadMeta(); }, "Meta disconnected.")} disabled={Boolean(busy)} className={`${ICON_BUTTON_CLASS} text-rose-700`} aria-label="Disconnect Meta"><Unplug className="size-4" /></button>
            </>}
          </div>
        </div>

        {!meta?.configured ? <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><CircleAlert className="mr-2 inline size-4" />Meta publishing is not configured on the backend yet.</p> : null}
        {error ? <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
        {message ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p> : null}

        {meta?.connection ? <div className="mt-7 grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-7">
            <section className="rounded-2xl border border-[#ded7e3] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold">Delivery accounts</h2><p className="mt-1 text-xs text-[#726979]">Select the Pages and Instagram accounts available to campaigns.</p></div><span className="rounded-full bg-[#f2eafa] px-3 py-1 text-xs font-semibold text-[#4f378a]">{meta.connection.status.toLowerCase()}</span></div>
              <div className="mt-4 divide-y divide-[#eee8f0]">{meta.connection.accounts.map((account) => <label key={account.id} className="flex cursor-pointer items-center gap-3 py-3"><input type="checkbox" checked={account.selected} disabled={!account.available || Boolean(busy)} onChange={(event) => void run(`account-${account.id}`, async () => { await selectMetaAccount(account.id, event.target.checked); await loadMeta(); })} className="size-4 accent-[#4f378a]" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{account.name}</span><span className="block text-xs text-[#726979]">{account.platform.toLowerCase()}{account.username ? ` · @${account.username}` : ""}</span></span>{account.selected ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}</label>)}</div>
            </section>

            <form onSubmit={schedule} className="rounded-2xl border border-[#ded7e3] bg-white p-5 shadow-sm">
              <h2 className="font-bold">Schedule approved content</h2>
              <p className="mt-1 text-xs text-[#726979]">Only content generated from an approved strategy is accepted by the backend.</p>
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-semibold">Project<select value={projectId} onChange={(event) => void chooseProject(event.target.value)} className={`${FIELD_CLASS} mt-1`}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                <label className="block text-xs font-semibold">Campaign<select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className={`${FIELD_CLASS} mt-1`}><option value="">Choose a campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label>
                <label className="block text-xs font-semibold">Content<select value={contentId} onChange={(event) => setContentId(event.target.value)} className={`${FIELD_CLASS} mt-1`}><option value="">Choose generated content</option>{contents.map((content) => <option key={content.id} value={content.id}>{content.title || content.body?.slice(0, 70) || content.type}</option>)}</select></label>
                <label className="block text-xs font-semibold">Account<select value={effectiveAccountId} onChange={(event) => setAccountId(event.target.value)} className={`${FIELD_CLASS} mt-1`}><option value="">Choose an account</option>{selectedAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.platform.toLowerCase()}</option>)}</select></label>
                <label className="block text-xs font-semibold">Publish at<input type="datetime-local" value={scheduledFor} min={new Date().toISOString().slice(0, 16)} onChange={(event) => setScheduledFor(event.target.value)} className={`${FIELD_CLASS} mt-1`} /></label>
              </div>
              <button disabled={!contentId || !effectiveAccountId || !scheduledFor || busy === "schedule"} className={`${PRIMARY_BUTTON_CLASS} mt-4`}><CalendarClock className="mr-2 inline size-4" />{busy === "schedule" ? "Scheduling…" : "Schedule post"}</button>
            </form>
          </div>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Publication queue</h2><p className="mt-1 text-xs text-[#726979]">Provider responses and retry decisions remain attached to each publication.</p></div><select value={statusFilter} onChange={(event) => { const value = event.target.value; setStatusFilter(value); void refreshPublications(value); }} className="min-h-10 rounded-xl border border-[#cbbdde] bg-white px-3 text-xs font-semibold"><option value="">All statuses</option>{Object.keys(STATUS_STYLE).map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}</select></div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#ded7e3] bg-white shadow-sm">{publications.length ? publications.map((publication) => <article key={publication.id} className="border-b border-[#eee8f0] p-5 last:border-0"><div className="flex flex-wrap items-start gap-3"><PublicationImage mediaUrl={publication.mediaUrl} title={publication.content?.title || publication.content?.campaign?.name || "Campaign post"} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[publication.status] ?? STATUS_STYLE.CANCELLED}`}>{publication.status.toLowerCase()}</span><span className="text-xs font-semibold text-[#4f378a]">{publication.platform.toLowerCase()} · {publication.accountName}</span></div><h3 className="mt-3 text-sm font-semibold">{publication.content?.title || publication.content?.campaign?.name || "Campaign post"}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#726979]">{publication.caption}</p><p className="mt-2 text-xs text-[#625b71]">{new Date(publication.scheduledFor).toLocaleString()}</p>{publication.error ? <p className="mt-2 text-xs text-rose-700">{publication.error}</p> : null}</div><div className="flex gap-2">{["QUEUED", "SCHEDULED"].includes(publication.status) ? <button type="button" onClick={() => void run(`cancel-${publication.id}`, async () => { await cancelPublication(publication.id); await refreshPublications(); }, "Publication cancelled.")} disabled={Boolean(busy)} className={`${ICON_BUTTON_CLASS} text-rose-700`} aria-label="Cancel publication"><XCircle className="size-4" /></button> : null}{publication.status === "FAILED" ? <button type="button" onClick={() => void run(`retry-${publication.id}`, async () => { await retryPublication(publication.id); await refreshPublications(); }, "Publication queued for retry.")} disabled={Boolean(busy)} className={`${ICON_BUTTON_CLASS} text-[#4f378a]`} aria-label="Retry publication"><RotateCcw className="size-4" /></button> : null}{publication.status === "PUBLISHED" ? <Send className="mt-2 size-4 text-emerald-600" /> : null}</div></div></article>) : <div className="p-10 text-center"><CalendarClock className="mx-auto size-6 text-[#8d7c98]" /><p className="mt-3 text-sm font-semibold">No publications in this view</p><p className="mt-1 text-xs text-[#807586]">Schedule approved content or change the status filter.</p></div>}</div>
          </section>
        </div> : <MetaPublishingPreview />}
      </div>
    </section>
  );
}
