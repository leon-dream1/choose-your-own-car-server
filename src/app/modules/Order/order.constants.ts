export type TOrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'cancelled';

export interface SSLCommerzInitData {
  total_amount: number;
  currency: 'BDT';
  tran_id: string;

  success_url: string;
  fail_url: string;
  cancel_url: string;

  ipn_url?: string;

  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_country: string;
  cus_phone: string;

  product_name: string;
  product_category: string;
  product_profile: 'general' | 'physical-goods';
  shipping_method: 'NO' | 'YES';

  num_of_item?: number;
}
