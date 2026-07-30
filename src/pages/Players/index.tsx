import { useEffect, useState } from 'react';
import { getPlayers, deletePlayer } from '../../lib/clan';
import PageMeta from '../../components/common/PageMeta';

interface Player {
  player_id: string;
  discord_user_id: string | null;
  player_name: string;
  player_level: number;
  clan_tag: string;
  timezone: string;
  timezone_offset: string;
  region: string;
  status: string;
  created_at: string;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    setLoading(true);
    try {
      const result = await getPlayers({ limit: 100 });
      setPlayers(result.data || []);
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(playerId: string, playerName: string) {
    if (confirm(`Are you sure you want to delete player "${playerName}"?`)) {
      try {
        await deletePlayer(playerId);
        await loadPlayers();
      } catch (error) {
        console.error('Failed to delete player:', error);
      }
    }
  }

  const filteredPlayers = players.filter(p => {
    const matchSearch = p.player_name.toLowerCase().includes(search.toLowerCase()) ||
      p.player_id.toLowerCase().includes(search.toLowerCase());
    const matchRegion = filterRegion === 'ALL' || p.region === filterRegion;
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchRegion && matchStatus;
  });

  const regions = [...new Set(players.map(p => p.region).filter(Boolean))];

  return (
    <>
      <PageMeta title="Players | ARIES Admin" description="Manage verified players" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Players</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {players.length} verified players
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ALL">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="LEFT_CLAN">Left Clan</option>
              <option value="BANNED">Banned</option>
            </select>
            <button
              onClick={loadPlayers}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="animate-pulse space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Player ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Level</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Clan</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Timezone</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Region</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.player_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-800 dark:text-gray-200">{player.player_id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{player.player_name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{player.player_level}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{player.clan_tag}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{player.timezone_offset}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{player.region}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          player.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          player.status === 'BANNED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(player.player_id, player.player_name)}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPlayers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No players found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
