# LYNK Frontend

Expo React Native app for the LYNK mobile experience.

## Stack

- Expo SDK 55
- React Native 0.83
- React 19
- Expo Router entrypoint: `expo-router/entry`
- TypeScript
- React Query
- Zustand
- Reanimated

## Setup

```bash
cd frontend
npm ci --legacy-peer-deps
```

The repository includes `frontend/.npmrc` with `legacy-peer-deps=true` to keep local installs aligned with CI.

## Run

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Validation

```bash
npm run typecheck
npm run lint
npm run doctor
```

`lint` currently delegates to TypeScript validation until a dedicated Expo ESLint configuration is added.

## Environment variables

Expo public variables must be prefixed with `EXPO_PUBLIC_`:

```text
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_WS_URL=http://localhost:3000
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EXPO_PUBLIC_SENTRY_DSN=
```

Types are declared in `env.d.ts`.

## Routing and aliases

- App entrypoint is configured in `package.json` as `expo-router/entry`.
- TypeScript alias `@/*` maps to `src/*`.
- Prefer imports such as `@/components/ui/...`, `@/providers/...`, and `@/services/...`.

## Reanimated safety rule

Any file using `interpolate` from `react-native-reanimated` must also import/reference `Extrapolate` when extrapolation is needed. Keep this checked before merging animation changes.

## Known environment issue

In this container, local frontend installation has previously been blocked by an external registry/proxy returning `403 Forbidden` for `@react-native/debugger-frontend`. Do not hide this failure. Validate frontend in GitHub Actions or another npm environment with normal registry access.
