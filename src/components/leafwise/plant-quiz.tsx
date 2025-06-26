'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, Puzzle, RotateCcw, Award } from 'lucide-react';
import quizData from '@/data/quiz.json';
import { cn } from '@/lib/utils';

type QuizQuestion = {
  id: number;
  imageUrl: string;
  dataAiHint: string;
  options: string[];
  answer: string;
  feedback: string;
};

export default function PlantQuiz() {
  const [questions] = useState<QuizQuestion[]>(quizData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isQuizFinished = currentQuestionIndex >= questions.length;

  const handleAnswerSelect = (option: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(option);
    setShowFeedback(true);
    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };
  
  if (isQuizFinished) {
    return (
      <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-3 font-headline text-2xl md:text-3xl text-primary">
            <Award className="h-8 w-8" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-muted-foreground mb-4">
            Your final score is:
          </p>
          <p className="text-5xl font-bold text-primary mb-6">
            {score} / {questions.length}
          </p>
          <Button onClick={handleRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl md:text-3xl text-primary">
          <Puzzle className="h-6 w-6" />
          Guess the Plant!
        </CardTitle>
         <div className="text-sm text-muted-foreground pt-2 flex justify-between">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden mb-6">
          <Image
            src={currentQuestion.imageUrl}
            alt="Plant to identify"
            fill
            className="object-cover"
            data-ai-hint={currentQuestion.dataAiHint}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQuestion.options.map(option => (
            <Button
              key={option}
              variant="outline"
              size="lg"
              className={cn(
                "justify-start h-auto py-3 text-left whitespace-normal",
                showFeedback && option === currentQuestion.answer && 'border-green-500 bg-green-500/10 text-green-700',
                showFeedback && selectedAnswer === option && option !== currentQuestion.answer && 'border-red-500 bg-red-500/10 text-red-700'
              )}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
            >
              {option}
            </Button>
          ))}
        </div>
        {showFeedback && (
          <div className="mt-6 animate-in fade-in-50">
            <Alert variant={selectedAnswer === currentQuestion.answer ? 'default' : 'destructive'} className={selectedAnswer === currentQuestion.answer ? 'border-green-500 text-green-700' : ''}>
              {selectedAnswer === currentQuestion.answer ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4" />}
              <AlertTitle>{selectedAnswer === currentQuestion.answer ? 'Correct!' : 'Not quite!'}</AlertTitle>
              <AlertDescription>
                {currentQuestion.feedback}
              </AlertDescription>
            </Alert>
            <Button onClick={handleNextQuestion} className="w-full mt-4">
              Next Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
