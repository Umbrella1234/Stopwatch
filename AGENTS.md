- **Naming**: Folder name must match the component and main file name.
- **Props**: Always export the props interface from `ComponentName.types.ts`. Never define props inline in the component file.
- **Legacy Pattern (AVOID)**: Do not use `ComponentName/types/ComponentNameProps.tsx`.

## ⚛️ React & JSX Rules

- **React Imports**: Use direct named imports: `import React, { FC } from 'react'`.
  - ❌ **Forbidden**: `React.FC` or the `type` keyword in imports (e.g., `import type`).
- **JSX Handlers**:
  - **One-liners**: Use anonymous functions directly in JSX.
  - **Multi-liners**: Define named arrow functions outside of the returned JSX.
  - **Inference**: Rely on TypeScript to infer handler parameters. Do not duplicate type annotations.

Defining component props:
Wrong: const FullscreenPageCollapseButton = (props: FullscreenPageCollapseButtonProps) => null
Right: const FullscreenPageCollapseButton: FC<FullscreenPageCollapseButtonProps> = (props) => null

```typescript
// ✅ Good - anonymous function for one-liner (type 'open' is inferred)
<Modal onOpenChange={(open) => !open && onHide()} />

// ❌ Bad - redundant type annotation
<Modal onOpenChange={(open: boolean) => !open && onHide()} />

// ✅ Good - named function for multi-liner (type inferred from ComponentProps)
import { ComponentProps } from 'react';

const handleOpenChange: ComponentProps<typeof Modal>['onOpenChange'] = (open) => {
  if (!open) {
    onHide();
  }
  doSomething1();
  doSomething2();
};
return <Modal onOpenChange={handleOpenChange} />;

// ❌ Bad - too long for inline
<Modal onOpenChange={(open) => {
  if (!open) onHide();
  doSomething1();
  doSomething2();
}} />
```

- **Props Destructuring**: Do not use `false` as a default value; let it default to `undefined`.

  ```typescript
  // ✅ Good
  const { showToolbar } = props;

  // ❌ Bad
  const { showToolbar = false } = props;
  ```

- **Hooks**: Use `useMemo` and `useCallback` **ONLY** for heavy calculations or memoized child components. Default to no memoization.

  ```typescript
  // ❌ Bad - unnecessary useCallback (no memoization benefit)
  const handleClick = () => doSomething();

  // ✅ Good - useCallback used ONLY when passing to memoized component
  const handleClick = useCallback(() => doSomething(value), [value]);
  return <MemoizedChild onClick={handleClick} />;
  ```

- **IIFEs**: Never use immediately invoked function expressions for computed values. Extract a named function instead.

  ```typescript
  // ❌ Bad - IIFE in render/hook body
  const videoDuration = (() => {
    if (checkIsVideoAsset(asset)) return asset.duration;
    return 0;
  })();

  // ✅ Good - standalone function defined outside the component
  const getVideoDuration = (...) => { ... };
  const videoDuration = getVideoDuration(...);
  ```

- **Conditional Logic**: Always place the **positive/truthy** branch first in if/else and ternary.

  ```typescript
  // ✅ Good — positive condition first
  if (thumbnailQueuer.addItem({ assetId, file })) {
    videoThumbnailQueuedCount++;
  } else {
    setSkipped(assetId);
  }

  // ❌ Bad — negated condition first
  if (!thumbnailQueuer.addItem({ assetId, file })) {
    setSkipped(assetId);
  } else {
    videoThumbnailQueuedCount++;
  }

  // ✅ Good — positive condition first
  bottomText={isAvailable ? undefined : 'Error message'}

  // ❌ Bad — negated condition first
  bottomText={!isAvailable ? 'Error message' : undefined}
  ```

## 📦 Import Rules

- **Barrel Exports**: **Strictly forbidden**. Never use `index.ts` to re-export.
- **Path Aliases**: Use `@/` (maps to `src/`) for nesting > 2 levels.
- **Organization**: Sorted via `simple-import-sort`:
  ```typescript
  // 1. External packages
  import React from "react";
  // 2. Absolute imports (@/ alias)
  import { apiClient } from "@/apiClient";
  // 3. Relative imports
  import { localHelper } from "./helpers";
  ```

## 🗃️ Redux Patterns

- **Hooks**: Prefer `useAppDispatch` and `useAppSelector`.
- **Selectors**:
  - **Parameterized**: Always use `createCollectionAppSelector` with explicit parameter dependencies.
  - **Naming**: Infer variable name from selector: `const hasAnyVideoInActiveSlots = useAppSelector(selectHasAnyVideoInActiveSlots)`.

  ```typescript
  // ✅ Good: Parameterized selector with explicit param dependency
  export const getUsersInvitedToWorkspace = createCollectionAppSelector(
    [
      getWorkspaceUsers,
      (_state, workspaceId: string) => workspaceId,
    ],
    (users, workspaceId): Array<Member> => { ... }
  );

  // ❌ Bad: Selector factory (Legacy - creates new instances)
  export const getUsersInvited = (id: string) => createSelector([getUsers], (users) => users[id]);

  // ❌ Bad: Higher-order selector (Returns a function)
  export const getDataFn = createSelector([getData], (data) => (id: string) => data[id]);
  ```

## 📘 TypeScript Patterns

- **Array Syntax**: Always use `Array<Type>`, never `Type[]`.
- **Function Params**: Use an object pattern for >2 parameter with a named type. Single and double positional parameters are acceptable.

  ```typescript
  // ✅ Good - single positional parameter
  export const getId = (item: Item) => item.id;

  // ✅ Good - two positional parameters
  export const setCoordinates = (x: number, y: number) => { ... };

  // ✅ Good - object params with named type (3+ parameters)
  type CalculateRangeParams = {
    ids: Array<string>;
    selectedId: string;
    mode: SelectionMode;
  };
  export const calculateRange = ({ ids, selectedId, mode }: CalculateRangeParams) => { ... };

  // ❌ Bad - three or more positional parameters
  export const calculateRange = (ids: Array<string>, selectedId: string, mode: SelectionMode) => { ... };
  ```

- **Strict Mode**: Handle `undefined` and `null` explicitly.

## 🧪 Test Mocking Patterns

### Correct react-redux mock (no useSelector override)

When a component uses `useSelector` with individual selectors, do NOT mock `useSelector` in the react-redux mock. Instead, mock individual selectors via their own `jest.mock` calls and wrap the component in a real Redux Provider via `toStoreUtils`.

```typescript
// ✅ Correct — no useSelector mock
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

// ❌ Wrong — mocking useSelector to call selectors with empty state
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: (fn: any) => fn({}), // DO NOT DO THIS
}));
```

### Individual selector mocks with jest.requireActual

Always use `jest.requireActual` in selector mocks to preserve unmocked exports from the same module.

```typescript
// ✅ Correct
jest.mock("@/selectors/LoadingDataSelectors", () => ({
  ...jest.requireActual("@/selectors/LoadingDataSelectors"),
  getAreActionsLoadingFn: jest.fn(),
}));

// ❌ Wrong — missing jest.requireActual, other exports become undefined
jest.mock("@/selectors/LoadingDataSelectors", () => ({
  getAreActionsLoadingFn: jest.fn(),
}));
```

### Using getMockedFunction instead of direct mockReturnValue casts

Use the `getMockedFunction` helper from `@/utilities/tests/testHelper` instead of TypeScript type casts with `.mockReturnValue`.

```typescript
import { getMockedFunction } from "@/utilities/tests/testHelper";

// ✅ Correct
getMockedFunction({
  selector: getUserGroups,
  value: { id1: { handle: "h1" } },
});

// ❌ Wrong — verbose type cast
(getUserGroups as jest.MockedFunction<typeof getUserGroups>).mockReturnValue({
  id1: { handle: "h1" },
});
```

### Wrapping component with Provider (toStoreUtils)

When a component uses `useSelector` with real Redux selectors, wrap it in a Provider using `toStoreUtils`:

```typescript
import { toStoreUtils } from '@/support/tests/toStoreUtils';

// ✅ Correct
const wrapper = render(toStoreUtils({ node: <MyComponent {...props} /> }));
```

### Do NOT mock reselect

Never mock the `reselect` module directly — it causes `createSelector` to break.

```typescript
// ❌ Wrong — never mock reselect
jest.mock('reselect', () => ({ ... }));
```

### useGEFlags hook mocking

When mocking the `useGEFlags` hook from `@/utilities/ldClient`, always use `jest.requireActual` and the `getMockedFunction` helper:

```typescript
jest.mock("@/utilities/ldClient", () => ({
  ...jest.requireActual("@/utilities/ldClient"),
  useGEFlags: jest.fn(),
}));

// In test setup, BEFORE rendering:
getMockedFunction({
  selector: useGEFlags,
  value: { publicLinkPermissions: true } as LDFlags,
});
```

## 🎨 Styling

- **ClassNames**: Always use the `classnames` library.

  ```typescript
  // ✅ Good
  <div className={classNames('flex gap-2', className)}>

  // ❌ Bad
  <div className={`flex gap-2 ${className || ''}`}>
  ```

- **SCSS Modules**: Imports are enforced by `no-unassigned-module-scss-imports`.

## 📝 Code Comments

- **Never write comments** unless explicitly asked.
- **If asked to add a comment**, describe **what the function/hook does from the caller's perspective** — how to use it, not how it's built internally. Never mention libraries, data structures, or implementation details.

  ```typescript
  // ✅ Good — describes usage only
  /* Subscribes to the video thumbnail store for a single asset. Use it to get a thumbnail for asset id. */
  const useVideoThumbnail = (assetId: string) => { ... };

  // ❌ Bad — describes internal implementation
  /* Built on top of @tanstack/react-store's useStore — the selector returns the entry for this assetId,
     and default === equality suppresses re-renders when the entry reference hasn't changed. */
  const useVideoThumbnail = (assetId: string) => { ... };
  ```

  Use `/* */` style for function/hook comments. Apply the same principle to mutation helpers and other exported functions — describe the effect (e.g. "Sets the entry state to inProgress — thumbnail generation is queued."), not how it achieves it.

## 🗃️ RTK Query Mutation Patterns

- **Prefer fire-and-forget**: Call the mutation without `await` or `.unwrap()` so the caller returns immediately. Side effects (toasts, cache updates) are handled in the `onQueryStarted` callback on the API slice side.

  ```typescript
  // ✅ Good — fire-and-forget, side effects in onQueryStarted
  const [deleteItem] = useDeleteItemMutation();
  const handleRemove = () => {
    deleteItem({ id });
    onClose();
  };

  // ❌ Bad — unnecessary unwrap keeps caller waiting
  const handleRemove = async () => {
    try {
      await deleteItem({ id }).unwrap();
      onClose();
    } catch {
      // error handled in onQueryStarted
    }
  };
  ```

- **Use `.unwrap()` only when the caller genuinely needs the result before proceeding** (e.g., navigating after creation, or when the next action depends on the response data).

  ```typescript
  // ✅ .unwrap() justified — need the returned id before navigating
  const handleCreate = async () => {
    const newItem = await createItem(payload).unwrap();
    navigate(`/items/${newItem.id}`);
  };
  ```
