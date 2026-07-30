import { useEffect, useState } from 'react';
import { getTeams, createTeam, deleteTeam } from '../../lib/clan';
import PageMeta from '../../components/common/PageMeta';

interface Team {
  team_id: string;
  team_name: string;
  team_tier: string;
  description: string;
  max_members: number;
  captain_player_id: string;
  is_active: boolean;
  created_at: string;
}

const TIERS = ['MAIN', 'SECONDARY', 'ACADEMY', 'RESERVE'];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    team_tier: 'MAIN',
    description: '',
    max_members: 5,
  });

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    try {
      const result = await getTeams({ limit: 50 });
      setTeams(result.data || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createTeam(formData);
      setShowCreateModal(false);
      setFormData({ team_name: '', team_tier: 'MAIN', description: '', max_members: 5 });
      await loadTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team. Check console for details.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(teamId: string, teamName: string) {
    if (confirm(`Delete team "${teamName}"?`)) {
      try {
        await deleteTeam(teamId);
        await loadTeams();
      } catch (error) {
        console.error('Failed to delete team:', error);
      }
    }
  }

  function getTierBadge(tier: string) {
    const styles: Record<string, string> = {
      MAIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      SECONDARY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      ACADEMY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      RESERVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[tier] || styles.MAIN;
  }

  return (
    <>
      <PageMeta title="Teams | ARIES Admin" description="Manage clan teams" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Teams</h2>
            <p className="text-gray-500 dark:text-gray-400">{teams.length} teams</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              + Create Team
            </button>
            <button onClick={loadTeams}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded dark:bg-gray-700"></div>)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div key={team.team_id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{team.team_name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadge(team.team_tier)}`}>
                    {team.team_tier}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{team.description || 'No description'}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>Max: {team.max_members} members</span>
                  <span className={team.is_active ? 'text-green-600' : 'text-red-600'}>
                    {team.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    View
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(team.team_id, team.team_name)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No teams found. Create your first team!</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create New Team</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name</label>
                  <input type="text" required value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    placeholder="e.g., Alpha, Bravo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tier</label>
                  <select value={formData.team_tier}
                    onChange={(e) => setFormData({ ...formData, team_tier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Team description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Members</label>
                  <input type="number" min="1" max="20" value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button type="submit" disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {creating ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
