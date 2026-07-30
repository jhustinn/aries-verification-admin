import { useEffect, useState } from 'react';
import { getSeasons, createSeason, getSeasonLeaderboard, ClanSeason } from '../../lib/database';
import PageMeta from '../../components/common/PageMeta';
import Modal from '../../components/common/Modal';

interface Season extends ClanSeason {}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    season_name: '',
    description: '',
    duration_days: 30,
  });

  useEffect(() => {
    loadSeasons();
  }, []);

  async function loadSeasons() {
    setLoading(true);
    try {
      const result = await getSeasons(20);
      setSeasons(result || []);
    } catch (error) {
      console.error('Failed to load seasons:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createSeason({
        ...formData,
        start_date: new Date().toISOString(),
        duration_days: parseInt(formData.duration_days.toString()),
      });
      setShowCreateModal(false);
      setFormData({ season_name: '', description: '', duration_days: 30 });
      await loadSeasons();
    } catch (error) {
      console.error('Failed to create season:', error);
      alert('Failed to create season. Check console for details.');
    } finally {
      setCreating(false);
    }
  }

  async function loadLeaderboard(seasonId: string) {
    setSelectedSeason(seasonId);
    try {
      const data = await getSeasonLeaderboard(seasonId, 10);
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      UPCOMING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return styles[status] || styles.UPCOMING;
  }

  return (
    <>
      <PageMeta title="Seasons | ARIES Admin" description="Manage clan seasons" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Seasons</h2>
            <p className="text-gray-500 dark:text-gray-400">{seasons.length} seasons</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              + Create Season
            </button>
            <button onClick={loadSeasons}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded dark:bg-gray-700"></div>)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {seasons.map((season) => (
              <div key={season.season_id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{season.season_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(season.start_date).toLocaleDateString()} - {season.end_date ? new Date(season.end_date).toLocaleDateString() : 'Ongoing'}
                      {' '}({season.duration_days} days)
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(season.status)}`}>
                    {season.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{season.total_wars}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Wars</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{season.wins}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{season.total_points_earned}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{season.total_participants}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => loadLeaderboard(season.season_id)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    Leaderboard
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {selectedSeason && leaderboard.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Season Leaderboard</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Rank</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Player</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry: any, index: number) => (
                  <tr key={entry.player_id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white">{entry.player?.player_name || entry.player_id}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{entry.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Season">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season Name</label>
              <input type="text" required value={formData.season_name}
                onChange={(e) => setFormData({ ...formData, season_name: e.target.value })}
                placeholder="e.g., Season 1, Season 2024-Q1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Season description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>
              <input type="number" min="7" max="90" value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Season'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
