export type Player = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Round = {
  id: string;
  name: string;
  lottery_type: 'quina' | 'mega_sena';
  status: 'active' | 'completed';
  start_date: string;
  end_date: string | null;
  payment_deadline?: string | null;
  round_start_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type Bet = {
  id: string;
  round_id: string;
  player_id: string;
  numbers: number[];
  created_at: string;
};

export type Payment = {
  id: string;
  bet_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'paid';
  created_at: string;
};

export type Draw = {
  id: string;
  round_id: string;
  draw_number: number;
  draw_date: string;
  numbers: number[];
  created_at: string;
};

export type Result = {
  id: string;
  bet_id: string;
  draw_id: string;
  matches_count: number;
  matched_numbers: number[];
  accumulated_matches: number;
  created_at: string;
};

export type Winner = {
  id: string;
  round_id: string;
  bet_id: string;
  player_id: string;
  prize_type: 'main' | 'second_place' | 'zero_hits' | 'daily_bonus';
  draw_id: string | null;
  prize_amount: number | null;
  created_at: string;
};
