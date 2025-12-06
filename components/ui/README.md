# UI Component Library

A comprehensive, reusable component library with dynamic properties and theme support.

## Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" fullWidth loading={false}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `loading`: boolean
- All standard button HTML attributes

### Card
A flexible card container with hover effects and customizable padding.

```tsx
import { Card } from '@/components/ui';

<Card hover padding="md">
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

**Props:**
- `hover`: boolean (enables hover shadow effect)
- `padding`: 'sm' | 'md' | 'lg' | 'none'
- All standard div HTML attributes

### Input
A form input component with label, error handling, and helper text.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  error={errors.email}
  helperText="Enter your email address"
  required
/>

<Input
  as="textarea"
  label="Description"
  rows={4}
  helperText="Enter a description"
/>
```

**Props:**
- `label`: string
- `error`: string (error message)
- `helperText`: string
- `fullWidth`: boolean
- `as`: 'input' | 'textarea'
- All standard input/textarea HTML attributes

### Select
A dropdown select component with label and error handling.

```tsx
import { Select } from '@/components/ui';

<Select
  label="Choose Option"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  placeholder="Select an option"
/>
```

**Props:**
- `label`: string
- `options`: Array<{ value: string | number, label: string, disabled?: boolean }>
- `error`: string
- `helperText`: string
- `placeholder`: string
- All standard select HTML attributes

### Modal
A modal dialog component with overlay and keyboard support.

```tsx
import { Modal, Button } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  }
>
  Modal content here
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnOverlayClick`: boolean
- `footer`: ReactNode (optional)

### LoadingSpinner
A loading indicator with customizable size and text.

```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="md" text="Loading..." fullScreen />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `text`: string (optional)
- `fullScreen`: boolean

### Badge
A badge component for status indicators.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info'

### Alert
An alert component for notifications and messages.

```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Success!" onClose={() => {}}>
  Operation completed successfully.
</Alert>
```

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'danger'
- `title`: string (optional)
- `onClose`: () => void (optional)

### ProgressBar
A progress bar component with customizable appearance.

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar
  value={75}
  max={100}
  showLabel
  size="md"
  variant="success"
/>
```

**Props:**
- `value`: number
- `max`: number (default: 100)
- `showLabel`: boolean
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'success' | 'warning' | 'danger'

### EmptyState
A component for displaying empty states.

```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  icon="📚"
  title="No Items"
  description="There are no items to display."
  action={{
    label: "Add Item",
    onClick: () => {},
    variant: "primary"
  }}
/>
```

**Props:**
- `icon`: ReactNode (optional)
- `title`: string
- `description`: string (optional)
- `action`: { label: string, onClick: () => void, variant?: string } (optional)

### PageContainer
A container component for page layouts with title and actions.

```tsx
import { PageContainer, Button } from '@/components/ui';

<PageContainer
  title="Page Title"
  description="Page description"
  maxWidth="xl"
  actions={<Button>Action</Button>}
>
  Page content
</PageContainer>
```

**Props:**
- `title`: string (optional)
- `description`: string (optional)
- `actions`: ReactNode (optional)
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

## Theme Support

All components automatically adapt to light/dark themes using CSS variables:
- `--background`: Background color
- `--foreground`: Text color
- `--border-color`: Border color
- `--color-primary`: Primary accent color

## Usage Example

```tsx
import { Card, Button, Input, Modal, Alert } from '@/components/ui';

function MyComponent() {
  return (
    <Card hover>
      <h2>Title</h2>
      <Input label="Name" required />
      <Button variant="primary" fullWidth>Submit</Button>
    </Card>
  );
}
```

