import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react'; // Explicitly import React

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page"> {/* Updated background color */}
      <h2 className="text-3xl font-bold font-roboto-headline text-prosper-text-dark mb-8 text-center"> {/* Applied heading font */}
        Choose experience {/* Updated copy */}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-prosper-text-dark">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-semibold font-roboto-headline"> {/* Updated font size and applied heading font */}
              Friendly Text-Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between text-center">
            <p className="text-prosper-text-dark mb-4">
              A casual, supportive text-only chat experience, like texting a peer mentor. Focuses on building confidence and soft skills.
            </p>
            <Link href="/concept1" passHref>
              <Button className="w-full bg-prosper-concept1-green hover:bg-prosper-concept1-green-dark text-white">
                Try Concept 1
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-prosper-text-dark">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-semibold font-roboto-headline"> {/* Updated font size and applied heading font */}
              Visual Buddy App
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between text-center">
            <p className="text-prosper-text-dark mb-4">
              A visual and gamified experience with light voice interaction, offering bite-sized skill games and milestones.
            </p>
            <Link href="/concept2" passHref>
              <Button className="w-full bg-prosper-concept2-purple hover:bg-prosper-concept2-purple-dark text-white">
                Try Concept 2
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-prosper-text-dark">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-semibold font-roboto-headline"> {/* Updated font size and applied heading font */}
              Professional Mentor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between text-center">
            <p className="text-prosper-text-dark mb-4">
              A formal, FaceTime-style video interaction with a human-like virtual coach, simulating interviews from admired brands.
            </p>
            <Link href="/concept3" passHref>
              <Button className="w-full bg-prosper-concept3-blue hover:bg-prosper-concept3-blue-dark text-white">
                Try Concept 3
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
