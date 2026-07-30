import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface VerificationTicket {
  ticket_id: string;
  user_id: string;
  in_game_name: string;
  permanent_image_url: string;
  ticket_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  player_id: string | null;
  player_name: string | null;
  player_level: number | null;
  extracted_text: string | null;
}

export interface DiscordUser {
  user_id: string;
  username: string;
  joined_at: string;
}

export interface Stats {
  totalUsers: number;
  totalTickets: number;
  pending: number;
  approved: number;
  rejected: number;
}

export async function getTickets(): Promise<VerificationTicket[]> {
  const { data, error } = await supabase
    .from('verification_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }

  return data || [];
}

export async function getUsers(): Promise<DiscordUser[]> {
  const { data, error } = await supabase
    .from('discord_users')
    .select('*')
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

export async function updateTicketStatus(
  ticketId: string,
  status: 'APPROVED' | 'REJECTED'
) {
  // Use bot API to update status (triggers player creation on approval)
  const BOT_API_URL = 'https://f31abf2a-3472-4eb6-ada0-131201065074-00-3ese77mjsce3q.sisko.replit.dev';
  const API_KEY = 'aries-admin-2024';

  const response = await fetch(`${BOT_API_URL}/api/discord/tickets/${ticketId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Failed to update ticket');
  }
}

export async function getStats(): Promise<Stats> {
  const [tickets, users] = await Promise.all([
    getTickets(),
    getUsers(),
  ]);

  const pending = tickets.filter((t) => t.ticket_status === 'PENDING').length;
  const approved = tickets.filter((t) => t.ticket_status === 'APPROVED').length;
  const rejected = tickets.filter((t) => t.ticket_status === 'REJECTED').length;

  return {
    totalUsers: users.length,
    totalTickets: tickets.length,
    pending,
    approved,
    rejected,
  };
}

export async function deleteTicket(ticketId: string) {
  const { error } = await supabase
    .from('verification_tickets')
    .delete()
    .eq('ticket_id', ticketId);

  if (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}
