# 🚀 Refactor Implementation Plan

## 📊 Quick Stats

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| `any` types | 207 instances | 0 | 🔴 P1 |
| Custom hooks | 2 | 30+ | 🔴 P1 |
| Folder naming consistency | 40% | 100% | 🟡 P2 |
| Feature modularity | 0% | 100% | 🟡 P2 |
| Code duplication | High | Low | 🟢 P3 |

---

## 🎯 Phase 1: Critical Fixes (Week 1)

### 1.1 Remove `any` Types (Priority 🔴)

**Files to Fix** (Top 20):
1. `src/pages/ProductRequests.tsx` - 13 instances
2. `src/pages/TaskManagement.tsx` - 8 instances
3. `src/pages/Vehicle.tsx` - 8 instances
4. `src/components/Page/TaskManagement/*` - 17 instances
5. `src/components/Page/ServiceAdmission/*` - 50+ instances

**Strategy**:
```typescript
// Before
const handleSubmit = (data: any) => { ... }

// After
interface SubmitData {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}
const handleSubmit = (data: SubmitData) => { ... }
```

### 1.2 Extract Custom Hooks (Priority 🔴)

**Current State**: Pages directly use `useQuery`/`useMutation`

**Target**: Create feature-specific hooks

**Hooks to Create**:
```typescript
// src/features/vehicles/hooks/useVehicles.ts
export const useVehicles = (filters: VehicleFilters) => {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehicleService.getAll(filters),
  });
};

// src/features/mechanics/hooks/useMechanics.ts
export const useMechanics = () => {
  return useQuery({
    queryKey: ['mechanics'],
    queryFn: () => mechanicService.getAll(),
  });
};

// ... 10+ more hooks
```

### 1.3 Rename Inconsistent Folders (Priority 🟡)

**Changes Needed**:
```
components/Page/leaveManagement/     → features/leaves/components/
components/Page/MechanicAttendance/ → features/attendance/components/
components/Page/mechanicManagement/ → features/mechanics/components/
```

---

## 🎯 Phase 2: Feature-Based Structure (Week 2-3)

### 2.1 Create Feature Folders

```
src/features/
├── vehicles/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
├── mechanics/
├── attendances/
├── services/
└── tasks/
```

### 2.2 Move Vehicle Feature

**Files to Move**:
- `src/Pages/Vehicle.tsx` → `src/features/vehicles/pages/Vehicle.tsx`
- `src/components/Page/Vehicle/*` → `src/features/vehicles/components/`
- Extract hooks from Vehicle.tsx → `src/features/vehicles/hooks/`

### 2.3 Split ServiceAdmission (26 files → 5 features)

**Current**: 26 files in one folder

**New Structure**:
```
serviceAdmission/
├── components/
│   ├── reception/           # Reception-related components
│   ├── services/            # Service management
│   ├── factors/             # Factor generation
│   ├── products/            # Product requests
│   └── uploads/             # File uploads
├── hooks/
│   ├── useReception.ts
│   ├── useServices.ts
│   └── useProducts.ts
└── pages/
```

---

## 🎯 Phase 3: Optimization (Week 4)

### 3.1 Implement Proper Modal Management

**Current**: Modals embedded in components

**Target**: Centralized modal system

```typescript
// src/shared/hooks/useModal.ts
export const useModal = () => {
  const [modal, setModal] = useState<ModalState | null>(null);
  
  const openModal = (type: string, data?: any) => {
    setModal({ type, data });
  };
  
  return { modal, openModal, closeModal };
};
```

### 3.2 Code Splitting by Feature

```typescript
// src/app/router/index.tsx
const Vehicle = lazy(() => import('@/features/vehicles/pages/Vehicle'));
const Mechanic = lazy(() => import('@/features/mechanics/pages/Mechanic'));

<Suspense fallback={<Loading />}>
  <Vehicle />
</Suspense>
```

### 3.3 Split Large Utilities

```typescript
// Before: utils/index.ts (605 lines)
export const utility1 = () => {};
export const utility2 = () => {};
// ... 50+ utilities

// After:
// utils/formatters.ts
// utils/validators.ts
// utils/parsers.ts
// utils/dates.ts
```

---

## 🎯 Phase 4: Testing & Documentation (Week 5-6)

1. ✅ Write unit tests for hooks
2. ✅ Add Storybook for components
3. ✅ Document API contracts
4. ✅ Performance testing
5. ✅ Code review

---

## 📝 Implementation Checklist

### Week 1: Critical
- [ ] Remove 207 `any` types
- [ ] Create 10+ custom hooks
- [ ] Rename inconsistent folders
- [ ] Setup TypeScript strict mode

### Week 2-3: Structure
- [ ] Create features/ folder
- [ ] Refactor Vehicle feature
- [ ] Refactor Mechanics feature
- [ ] Split ServiceAdmission

### Week 4: Optimization
- [ ] Modal management system
- [ ] Code splitting
- [ ] Bundle optimization
- [ ] Performance monitoring

### Week 5-6: Polish
- [ ] Testing suite
- [ ] Documentation
- [ ] Code review
- [ ] Final deployment

---

## 🚀 Ready to Start?

I've created a comprehensive audit report. Let me know which phase you'd like to start with:

**Option 1**: Start with Phase 1 (Remove `any` types + Create hooks)  
**Option 2**: Start with Vehicle feature refactoring (Proof of concept)  
**Option 3**: Full structure migration (All features at once)

**Recommendation**: Start with Option 1 - Quick wins with immediate impact! 🎯

