'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Pin } from 'lucide-react';
import type { StickyNote } from '@/types';

const LOCAL_STORAGE_KEY = 'leafwiseStickyNotes';

export default function StickyNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedNotes = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
      } catch (e) {
        console.error('Failed to save notes to localStorage', e);
      }
    }
  }, [notes, isClient]);

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const note: StickyNote = {
      id: Date.now(),
      text: newNote.trim(),
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  if (!isClient) {
      return null;
  }

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl md:text-3xl text-primary">
          <Pin className="h-6 w-6" />
          Sticky Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Jot down quick reminders or thoughts. Your notes are saved in your browser.
        </p>
        <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            className="flex-grow"
          />
          <Button type="submit">Add Note</Button>
        </form>

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map(note => (
              <div
                key={note.id}
                className="flex items-center justify-between p-3 bg-accent/20 rounded-lg"
              >
                <p className="text-foreground text-sm flex-grow pr-4">{note.text}</p>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Delete note</span>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">You have no notes yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
