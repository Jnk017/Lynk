# Production Readiness — Phase 8: Frontend Validation

## Goal

Validate the Expo frontend so it can be installed, type-checked, linted and reviewed in CI without hiding dependency or registry issues.

## What was inspected

- `frontend/package.json` already points `main` to `expo-router/entry`, so Expo Router is the application entrypoint.
- `frontend/tsconfig.json` already extends `expo/tsconfig.base` and defines the `@/*` alias for source-root imports.
- Reanimated usage was scanned for `interpolate` and `Extrapolate`; the current files using interpolation already import/use `Extrapolate`.
- `frontend/src/components/ui/GradientText.tsx` imports `@react-native-masked-view/masked-view`; that package was missing from frontend dependencies and has now been declared.
- `frontend/.npmrc` keeps `legacy-peer-deps=true` so `npm ci` and CI use the same dependency-resolution mode as the manual validation commands.
- `frontend/src/constants/api.ts` uses Expo public environment variables; a lightweight `frontend/env.d.ts` declaration now provides those process env types without requiring Node globals in the app runtime.

## Fixes applied

- Added `@react-native-masked-view/masked-view@0.3.2`, which matches the Expo SDK 55 compatible package line used by the project.
- Added frontend environment declarations for `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL`.
- Kept the frontend validation scripts introduced in Phase 7:
  - `npm run lint` delegates to the TypeScript typecheck until a dedicated Expo ESLint config is added.
  - `npm run typecheck` runs `tsc --noEmit`.
  - `npm run doctor` runs `expo-doctor` through `npx`.
- Documented the current npm registry blocker instead of masking it.

## Validation results in this environment

- `npm ci --legacy-peer-deps` is still blocked by the configured registry/proxy with `403 Forbidden` on `@react-native/debugger-frontend`.
- `npm view @react-native/debugger-frontend@0.83.6 version` is also blocked with the same `403 Forbidden`, confirming this is not caused only by the app lockfile.
- Because dependencies cannot be installed, `npm run lint` and `npm run typecheck` fail locally with missing modules such as `expo`, `react`, `react-native`, `expo-router`, `@react-native-masked-view/masked-view`, and the missing inherited `expo/tsconfig.base`.
- The previous `process.env` typing gap for `EXPO_PUBLIC_*` values is addressed by `frontend/env.d.ts`; the remaining TypeScript failures are dependency-install related in this environment.

## Required follow-up in an unblocked npm environment

Run the following commands where npm can access the public registry or an internal mirror containing React Native packages:

```bash
cd frontend
npm ci --legacy-peer-deps
npm run lint
npm run typecheck
npm run doctor
```

If GitHub Actions sees the same `403 Forbidden`, fix the npm registry/mirror policy for scoped packages, especially `@react-native/debugger-frontend`, before treating frontend CI as production-valid.

## Remaining limitation

Phase 8 improves dependency correctness and documents the validation blocker, but frontend install/typecheck cannot be honestly marked green in this environment until the npm registry allows the React Native debugger package to be fetched.
