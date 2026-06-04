declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
    readonly EXPO_PUBLIC_WS_URL?: string;
    readonly EXPO_PUBLIC_POSTHOG_API_KEY?: string;
    readonly EXPO_PUBLIC_POSTHOG_HOST?: string;
    readonly EXPO_PUBLIC_SENTRY_DSN?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
