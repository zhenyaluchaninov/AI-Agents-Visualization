
export type PersonalityColor =
  | 'visionary'
  | 'pragmatist'
  | 'cautious'
  | 'critic'
  | 'innovator'
  | 'mediator';

export type Agent = {
  role: string;
  personality: string;
  color: PersonalityColor;
};
