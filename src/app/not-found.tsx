import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-student-light to-white">
      <div className="max-w-lg w-full space-y-8 text-center px-4">
        {/* Fun 404 illustration */}
        <div className="space-y-6">
          <div className="text-9xl">🔍</div>
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-student">404</h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Oops! Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
              We searched everywhere, but this page seems to be hiding!
              Let&apos;s help you find your way back to the reading adventure.
            </p>
          </div>
        </div>

        {/* Child-friendly action buttons */}
        <div className="space-y-4">
          <Button
            asChild
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-student to-student-secondary hover:from-student-hover hover:to-student-secondary/90 shadow-lg"
          >
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Take Me Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 text-base border-student text-student hover:bg-student-light"
          >
            <Link href="/stories">
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Stories
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 text-base border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Link href="/create">
              <Search className="h-5 w-5 mr-2" />
              Create New Story
            </Link>
          </Button>
        </div>

        {/* Fun encouragement message */}
        <div className="mt-8 p-4 bg-white/80 rounded-lg border border-student/20">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Don&apos;t worry! Even the best explorers sometimes take wrong turns.
            That&apos;s how we discover new places!
          </p>
        </div>
      </div>
    </div>
  );
}