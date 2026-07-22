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
  const { error } = await supabase
    .from('verification_tickets')
    .update({ ticket_status: status })
    .eq('ticket_id', ticketId);

  if (error) {
    console.error('Error updating ticket:', error);
    throw error;
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
