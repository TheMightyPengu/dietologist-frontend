import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type NewsletterSubscriberGetDto = {
  id: number;
  email: string;
  fullName: string;
  isSubscribed: boolean;
  subscribedAt: string;
};

export type NewsletterSubscriberPostDto = {
  email: string;
  fullName: string;
};

export const NewsletterSubscribersApi = {
  async list(): Promise<NewsletterSubscriberGetDto[]> {
    const res = await axios.get<NewsletterSubscriberGetDto[]>(
      `${API_BASE}/NewsletterSubscribers`
    );

    return res.data;
  },

  async subscribe(
    payload: NewsletterSubscriberPostDto
  ): Promise<NewsletterSubscriberGetDto> {
    const res = await axios.post<NewsletterSubscriberGetDto>(
      `${API_BASE}/NewsletterSubscribers`,
      payload
    );

    return res.data;
  },
};