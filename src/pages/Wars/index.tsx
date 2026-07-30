import { useEffect, useState } from 'react';
import { getWars, deleteWar } from '../../lib/clan';
import PageMeta from '../../components/common/PageMeta';

interface War {
  war_id: string;
  opponent_name: string;
  opponent_team: string;
  war_type: string;
  team_size: number;
  scheduled_at: string;
  status: string;
  our_score: number | null;
  their_score: number | null;
  result: string | null;
  created_at: string;
}

export default function WarsPage() {
  const [wars, setWars] = useState<War[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadWars();
  }, []);

  async function loadWars() {
    setLoading(true);
    try {
      const result = await getWars({ limit: 50 });
      setWars(result.data || []);
    } catch (error) {
      console.error('Failed to load wars:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(warId: string) {
    if (confirm('Delete this war?')) {
      try {
        await deleteWar(warId);
        await loadWars();
      } catch (error) {
        console.error('Failed to delete war:', error);
      }
    }
  }

  const filteredWars = filterStatus === 'ALL' ? wars : wars.filter(w => w.status === filterStatus);

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || styles.SCHEDULED;
  }

  function getResultBadge(result: string | null) {
    if (!result) return '';
    const styles: Record<string, string> = {
      WIN: 'text-green-600',
      LOSS: 'text-red-600',
      DRAW: 'text-yellow-600',
    };
    return styles[result] || '';
  }

  return (
    <>
      <PageMeta title="Clan Wars | ARIES Admin" description="Manage clan wars" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clan Wars</h2>
            <p className="text-gray-500 dark:text-gray-400">{wars.length} wars</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              + Create War
            </button>
            <button onClick={loadWars} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
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
          <div className="space-y-4">
            {filteredWars.map((war) => (
              <div key={war.war_id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {war.result === 'WIN' ? '🏆' : war.result === 'LOSS' ? '😞' : '⚔️'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        vs {war.opponent_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {war.war_type} • {war.team_size}v{war.team_size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(war.status)}`}>
                      {war.status}
                    </span>
                    {war.result && (
                      <span className={`text-lg font-bold ${getResultBadge(war.result)}`}>
                        {war.result}
                      </span>
                    )}
                  </div>
                </div>

                {war.status === 'COMPLETED' && war.our_score !== null && (
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{war.our_score}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{war.their_score}</span>
                  </div>
                )}

                {war.scheduled_at && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Scheduled: {new Date(war.scheduled_at).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(war.war_id)}
                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredWars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No wars found</p>
          </div>
        )}
      </div>
    </>
  );
}
