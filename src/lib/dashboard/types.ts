export type DashboardAccount = {
  id: string;
  email: string;
};

export type DashboardUser = {
  id: string;
  email: string;
  accounts: DashboardAccount[];
};

export type UsersListResponse = {
  users: DashboardUser[];
};

export type CreateUserPayload = {
  email: string;
  password: string;
};

export type AccountRow = {
  id: string;
  email: string;
};

export type AccountSortField = "email" | "created_at" | "updated_at";
export type SortOrder = "asc" | "desc";

export type AccountsListResponse = {
  total: number;
  skip: number;
  limit: number;
  accounts: AccountRow[];
};

export type RequestLogItem = {
  id: string;
  user_id: string | null;
  requested_by: string | null;
  email: string;
  service_action_id: string | null;
  service_action_name: string | null;
  service_name: string | null;
  created_at: string | null;
};

export type RequestsListResponse = {
  total: number;
  skip: number;
  limit: number;
  items: RequestLogItem[];
};

export type ServiceItem = {
  id: string;
  name: string;
};

export type ServicesListResponse = {
  items: ServiceItem[];
};
