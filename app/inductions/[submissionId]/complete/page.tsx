'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers';
import { Card, Button, PageContainer } from '@/components/ui';

export default function CompletePage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center px-4">
      <PageContainer maxWidth="sm" className="text-center">
        <Card padding="lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Induction Completed!</h1>
            <p className="text-foreground-secondary">
              Thank you, {user?.name}! Your induction training has been completed successfully.
            </p>
          </div>

          <p className="text-sm text-foreground-secondary mb-6">
            A notification email has been sent to the administrator for review.
          </p>

          <Button
            fullWidth
            onClick={() => router.push('/inductions')}
          >
            Back to Inductions
          </Button>
        </Card>
      </PageContainer>
    </div>
  );
}

