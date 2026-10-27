export interface CreateReviewPayload {
  contentId: string;
  rating: number;
  body: string;
  tags: string[];
  spoiler?: boolean;
}

export interface UpdateReviewPayload {
  rating?: number;
  body?: string;
  tags?: string[];
  spoiler?: boolean;
}
