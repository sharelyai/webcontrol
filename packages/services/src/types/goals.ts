export interface GoalAction {
  type: string;
  [key: string]: any;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NOT_STARTED';
  actions?: GoalAction[];
  metadata?: Record<string, any>;
}

export interface GoalThread {
  id: string;
  goalId: string;
  title?: string;
  metadata?: Record<string, any>;
}
