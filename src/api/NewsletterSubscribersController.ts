import { api, toApiError } from "./_axios-client";

export type NewsletterSubscriberGetDto = {
  id: number;
  email: string;
  fullName: string;
  subscribedAt: string;
};

export type NewsletterSubscriberPostDto = {
  email: string;
  fullName: string;
};

export type NewsletterUnsubscribeResultDto = {
  message: string;
};

const base = "/NewsletterSubscribers";

export const NewsletterSubscribersApi = {
  async list(): Promise<
    NewsletterSubscriberGetDto[]
  > {
    try {
      const { data } =
        await api.get<
          NewsletterSubscriberGetDto[]
        >(base);

      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async subscribe(
    payload: NewsletterSubscriberPostDto,
  ): Promise<NewsletterSubscriberGetDto> {
    try {
      const { data } =
        await api.post<
          NewsletterSubscriberGetDto
        >(base, payload);

      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async unsubscribe(
    token: string,
  ): Promise<NewsletterUnsubscribeResultDto> {
    try {
      const { data } =
        await api.post<
          NewsletterUnsubscribeResultDto
        >(`${base}/unsubscribe`, {
          token,
        });

      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};