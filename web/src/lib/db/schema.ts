export interface Link {
  id: string;  // shortcode
  originalUrl: string;
  customPath?: string;
  createdAt: Date;
  updatedAt: Date;
  clicks: number;
}

export type NewLink = Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'clicks'>;