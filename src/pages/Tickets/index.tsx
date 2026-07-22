import { useEffect, useState } from 'react';
import { getTickets, updateTicketStatus, deleteTicket, VerificationTicket } from '../../lib/supabase';
import PageMeta from '../../components/common/PageMeta';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<VerificationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<VerificationTicket | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    const data = await getTickets();
    setTickets(data);
    setLoading(false);
  }

  function exportToCSV() {
    const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.ticket_status === filter);
    
    const headers = ['Ticket ID', 'User ID', 'In-Game Name', 'Player ID', 'Player Name', 'Level', 'Status', 'Created At', 'Screenshot URL'];
    const rows = filteredTickets.map(t => [
      t.ticket_id,
      t.user_id,
      t.in_game_name,
      t.player_id || '-',
      t.player_name || '-',
      t.player_level || '-',
      t.ticket_status,
      new Date(t.created_at).toLocaleString(),
      t.permanent_image_url
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verifications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleStatusChange(
    ticketId: string,
    status: 'APPROVED' | 'REJECTED'
  ) {
    try {
      await updateTicketStatus(ticketId, status);
      await loadTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  }

  async function handleDelete(ticketId: string) {
    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticketId);
        await loadTickets();
        setSelectedTicket(null);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || styles.PENDING;
  }

  const filteredTickets = filter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.ticket_status === filter);

  return (
    <>
      <PageMeta
        title="Verification Tickets | ARIES Admin"
        description="Manage verification tickets"
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Verification Tickets
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage all verification requests
            </p>
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
            <button
              onClick={loadTickets}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Export CSV
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
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Ticket ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">User ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">In-Game Name</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Player ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Level</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Screenshot</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.ticket_id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-800 dark:text-gray-200">
                        {ticket.ticket_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-800 dark:text-gray-200">
                        {ticket.user_id}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                        {ticket.in_game_name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {ticket.player_id || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {ticket.player_level || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={ticket.permanent_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View Image
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            ticket.ticket_status
                          )}`}
                        >
                          {ticket.ticket_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(ticket.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {ticket.ticket_status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(ticket.ticket_id, 'APPROVED');
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(ticket.ticket_id, 'REJECTED');
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTickets.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tickets found
              </p>
            )}
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Ticket Details
                </h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Ticket ID</label>
                  <p className="font-mono text-sm">{selectedTicket.ticket_id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">User ID</label>
                  <p className="font-mono text-sm">{selectedTicket.user_id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">In-Game Name</label>
                  <p>{selectedTicket.in_game_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedTicket.ticket_status)}`}>
                    {selectedTicket.ticket_status}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Player ID</label>
                  <p className="font-mono text-sm">{selectedTicket.player_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Player Name</label>
                  <p>{selectedTicket.player_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Player Level</label>
                  <p>{selectedTicket.player_level || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Created At</label>
                  <p>{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400">Screenshot</label>
                <a
                  href={selectedTicket.permanent_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Image
                </a>
              </div>

              {selectedTicket.extracted_text && (
                <div className="mb-4">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Extracted Text (OCR)</label>
                  <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                    {selectedTicket.extracted_text}
                  </pre>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {selectedTicket.ticket_status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedTicket.ticket_id, 'APPROVED')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTicket.ticket_id, 'REJECTED')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedTicket.ticket_id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
