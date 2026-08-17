const DEFAULT_BASE = "/api";

export function getApiBase() {
	const fromEnv = import.meta.env?.VITE_API_BASE_URL;
	const base = (fromEnv && String(fromEnv).trim()) || DEFAULT_BASE;
	return base.replace(/\/$/, "");
}

async function apiFetch(path, options = {}) {
	try {
		return await fetch(`${getApiBase()}${path}`, {
			...options,
			credentials: "include",
		});
	} catch (error) {
		if (error?.name === "AbortError") throw error;
		throw new Error(
			`Cannot reach the application API at ${getApiBase()}. Check VITE_API_BASE_URL and make sure the backend is running.`,
			{ cause: error }
		);
	}
}

export async function getDashboardOverview() {
	const res = await apiFetch("/admin/dashboard/overview");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load dashboard overview: ${res.status}`);
	}
	return res.json();
}

export async function getDashboardRevenue() {
	const res = await apiFetch("/admin/dashboard/revenue");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load revenue: ${res.status}`);
	}
	return res.json();
}

export async function getDashboardRevenueUsers() {
	const res = await apiFetch("/admin/dashboard/revenue/users");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load revenue users: ${res.status}`);
	}
	return res.json();
}

export async function getDashboardRevenuePlans() {
	const res = await apiFetch("/admin/dashboard/revenue/plans");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load revenue plans: ${res.status}`);
	}
	return res.json();
}

export async function getUsers() {
	const res = await apiFetch("/admin/users");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load users: ${res.status}`);
	}
	return res.json();
}

export async function getUser(id) {
	const res = await apiFetch(`/admin/users/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load user: ${res.status}`);
	}
	return res.json();
}

export async function patchUserStatus(id, status) {
	const res = await apiFetch(`/admin/users/${id}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status }),
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to update user status: ${res.status}`);
	}
	return res.json();
}

export async function patchUserRole(id, role) {
	const res = await apiFetch(`/admin/users/${id}/role`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ role }),
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to update user role: ${res.status}`);
	}
	return res.json();
}

export async function deleteUser(id) {
	const res = await apiFetch(`/admin/users/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to delete user: ${res.status}`);
	}
	return res.json();
}

export async function getUserCreditEvents(id) {
	const res = await apiFetch(`/admin/users/${id}/credit-events`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load credit events: ${res.status}`);
	}
	return res.json();
}

export async function getProjects() {
	const res = await apiFetch("/admin/projects");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load projects: ${res.status}`);
	}
	return res.json();
}

export async function getProject(id) {
	const res = await apiFetch(`/admin/projects/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load project: ${res.status}`);
	}
	return res.json();
}

export async function patchProjectStatus(id, status) {
	const res = await apiFetch(`/admin/projects/${id}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status }),
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to update project status: ${res.status}`);
	}
	return res.json();
}

export async function deleteProject(id) {
	const res = await apiFetch(`/admin/projects/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to delete project: ${res.status}`);
	}
	return res.json();
}

export async function getCampaigns() {
	const res = await apiFetch("/admin/campaigns");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load campaigns: ${res.status}`);
	}
	return res.json();
}

export async function getCampaign(id) {
	const res = await apiFetch(`/admin/campaigns/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load campaign: ${res.status}`);
	}
	return res.json();
}

export async function getStrategies() {
	const res = await apiFetch("/admin/strategies");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load strategies: ${res.status}`);
	}
	return res.json();
}

export async function getStrategy(id) {
	const res = await apiFetch(`/admin/strategies/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load strategy: ${res.status}`);
	}
	return res.json();
}

export async function patchStrategyReview(id, action, note) {
	const res = await apiFetch(`/admin/strategies/${id}/review`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ action, note }),
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to update strategy review: ${res.status}`);
	}
	return res.json();
}

export async function getGeneratedContent() {
	const res = await apiFetch("/admin/generated-content");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load generated content: ${res.status}`);
	}
	return res.json();
}

export async function getGeneratedContentId(id) {
	const res = await apiFetch(`/admin/generated-content/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load generated content: ${res.status}`);
	}
	return res.json();
}

export async function getKnowledgeSources() {
	const res = await apiFetch("/admin/knowledge-sources");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load knowledge sources: ${res.status}`);
	}
	return res.json();
}

export async function getKnowledgeSource(id) {
	const res = await apiFetch(`/admin/knowledge-sources/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load knowledge source: ${res.status}`);
	}
	return res.json();
}

export async function getSocialConnections() {
	const res = await apiFetch("/admin/social-connections");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load social connections: ${res.status}`);
	}
	return res.json();
}

export async function getSocialConnection(id) {
	const res = await apiFetch(`/admin/social-connections/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load social connection: ${res.status}`);
	}
	return res.json();
}

export async function getSocialAccounts() {
	const res = await apiFetch("/admin/social-accounts");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load social accounts: ${res.status}`);
	}
	return res.json();
}

export async function getSocialAccount(id) {
	const res = await apiFetch(`/admin/social-accounts/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load social account: ${res.status}`);
	}
	return res.json();
}

export async function getPlans() {
	const res = await apiFetch("/admin/plans");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load plans: ${res.status}`);
	}
	return res.json();
}

export async function getPlan(id) {
	const res = await apiFetch(`/admin/plans/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load plan: ${res.status}`);
	}
	return res.json();
}

export async function getCreditEvents() {
	const res = await apiFetch("/admin/credit-events");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load credit events: ${res.status}`);
	}
	return res.json();
}

export async function getWorkflowExecutions() {
	const res = await apiFetch("/admin/workflow-executions");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load workflow executions: ${res.status}`);
	}
	return res.json();
}

export async function getWorkflowExecution(id) {
	const res = await apiFetch(`/admin/workflow-executions/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load workflow execution: ${res.status}`);
	}
	return res.json();
}

export async function getEmails() {
	const res = await apiFetch("/admin/emails");
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load emails: ${res.status}`);
	}
	return res.json();
}

export async function getEmail(id) {
	const res = await apiFetch(`/admin/emails/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to load email: ${res.status}`);
	}
	return res.json();
}

export async function postEmailCancel(id) {
	const res = await apiFetch(`/admin/emails/${id}/cancel`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to cancel email: ${res.status}`);
	}
	return res.json();
}

export async function postEmailRetry(id) {
	const res = await apiFetch(`/admin/emails/${id}/retry`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || `Failed to retry email: ${res.status}`);
	}
	return res.json();
}
