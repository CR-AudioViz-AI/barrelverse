'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TastingNote {
  id: string;
  spirit_id: string;
  spirit_name: string;
  spirit_category: string;
  date: string;
  appearance: {
    color: string;
    clarity: string;
    legs: string;
  };
  nose: string[];
  palate: string[];
  finish: string;
  finish_length: 'short' | 'medium' | 'long' | 'very_long';
  overall_rating: number;
  notes: string;
  would_buy_again: boolean;
  price_paid?: number;
  proof?: number;
}

// AI-suggested descriptors by category
const AI_DESCRIPTORS = {
  nose: {
    bourbon: ['vanilla', 'caramel', 'oak', 'corn sweetness', 'brown sugar', 'butterscotch', 'baking spices', 'cinnamon', 'nutmeg', 'cherry', 'toffee', 'honey', 'maple', 'toasted nuts', 'leather'],
    scotch: ['peat smoke', 'heather', 'honey', 'malt', 'sea salt', 'iodine', 'dried fruit', 'sherry', 'citrus', 'floral', 'grass', 'brine', 'vanilla', 'oak', 'apple'],
    rye: ['spice', 'pepper', 'dill', 'rye bread', 'mint', 'herbal', 'citrus', 'cherry', 'clove', 'anise', 'caramel', 'oak', 'dark fruit', 'tobacco'],
    irish: ['honey', 'vanilla', 'orchard fruit', 'grass', 'cream', 'citrus', 'malt', 'floral', 'light spice', 'butterscotch', 'hay', 'green apple'],
    japanese: ['delicate fruit', 'cherry blossom', 'sandalwood', 'incense', 'subtle smoke', 'honey', 'vanilla', 'mizunara oak', 'white pepper', 'melon', 'citrus']
  },
  palate: {
    bourbon: ['sweet corn', 'vanilla cream', 'charred oak', 'caramel', 'baking spices', 'brown sugar', 'cherry', 'chocolate', 'tobacco', 'leather', 'pepper', 'honey', 'toffee', 'nuts'],
    scotch: ['smoke', 'peat', 'honey', 'malt', 'dried fruit', 'sherry sweetness', 'citrus', 'sea salt', 'dark chocolate', 'ginger', 'cinnamon', 'vanilla', 'oak tannins'],
    rye: ['bold spice', 'black pepper', 'rye grain', 'dill', 'mint', 'dark fruit', 'cherry', 'caramel', 'oak', 'herbal notes', 'clove', 'chocolate'],
    irish: ['creamy', 'honey', 'vanilla', 'green apple', 'pear', 'malt', 'gentle spice', 'citrus', 'toasted grain', 'light oak', 'butterscotch'],
    japanese: ['silky smooth', 'subtle fruit', 'mild oak', 'honey', 'white flowers', 'sandalwood', 'vanilla', 'light smoke', 'green tea', 'citrus zest']
  },
  appearance: {
    colors: ['pale straw', 'light gold', 'gold', 'amber', 'deep amber', 'copper', 'mahogany', 'dark caramel', 'russet'],
    clarity: ['crystal clear', 'brilliant', 'star bright', 'slight haze'],
    legs: ['thin and fast', 'medium', 'slow and thick', 'oily']
  },
  finish: {
    bourbon: ['warm oak', 'lingering sweetness', 'spice fade', 'caramel trail', 'gentle heat', 'vanilla echo', 'dry tannins'],
    scotch: ['smoky linger', 'maritime fade', 'dried fruit', 'warming spice', 'oak tannins', 'honey sweetness', 'peppery heat'],
    rye: ['spicy warmth', 'rye bread', 'peppery fade', 'mint coolness', 'dark fruit', 'dry oak', 'herbal notes'],
    irish: ['smooth fade', 'honey trail', 'gentle warmth', 'clean finish', 'light spice', 'fruity linger'],
    japanese: ['elegant fade', 'subtle warmth', 'clean and precise', 'delicate oak', 'gentle sweetness', 'refined finish']
  }
};

const SAMPLE_NOTES: TastingNote[] = [
  {
    id: '1',
    spirit_id: 's1',
    spirit_name: 'Buffalo Trace',
    spirit_category: 'bourbon',
    date: '2024-12-01',
    appearance: { color: 'amber', clarity: 'brilliant', legs: 'medium' },
    nose: ['vanilla', 'caramel', 'oak', 'light mint'],
    palate: ['brown sugar', 'vanilla cream', 'gentle spice', 'oak'],
    finish: 'Medium with lingering caramel and gentle warmth',
    finish_length: 'medium',
    overall_rating: 8.5,
    notes: 'Excellent daily sipper. Great value for the quality.',
    would_buy_again: true,
    price_paid: 28,
    proof: 90
  },
  {
    id: '2',
    spirit_id: 's2',
    spirit_name: 'Laphroaig 10',
    spirit_category: 'scotch',
    date: '2024-11-28',
    appearance: { color: 'light gold', clarity: 'crystal clear', legs: 'slow and thick' },
    nose: ['peat smoke', 'iodine', 'sea salt', 'vanilla'],
    palate: ['intense smoke', 'medicinal', 'sweetness underneath', 'brine'],
    finish: 'Very long, smoky, medicinal, with surprising sweetness at the end',
    finish_length: 'very_long',
    overall_rating: 9.0,
    notes: 'Challenging but rewarding. The quintessential Islay experience.',
    would_buy_again: true,
    price_paid: 55,
    proof: 86
  }
];

export default function TastingNotesPage() {
  const [notes, setNotes] = useState<TastingNote[]>(SAMPLE_NOTES);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TastingNote | null>(null);
  
  // New note form state
  const [newNote, setNewNote] = useState({
    spirit_name: '',
    spirit_category: 'bourbon' as keyof typeof AI_DESCRIPTORS.nose,
    appearance: { color: 'amber', clarity: 'brilliant', legs: 'medium' },
    nose: [] as string[],
    palate: [] as string[],
    finish: '',
    finish_length: 'medium' as TastingNote['finish_length'],
    overall_rating: 7,
    notes: '',
    would_buy_again: true,
    price_paid: undefined as number | undefined,
    proof: undefined as number | undefined
  });

  const toggleDescriptor = (type: 'nose' | 'palate', descriptor: string) => {
    const current = newNote[type];
    if (current.includes(descriptor)) {
      setNewNote({ ...newNote, [type]: current.filter(d => d !== descriptor) });
    } else if (current.length < 8) {
      setNewNote({ ...newNote, [type]: [...current, descriptor] });
    }
  };

  const saveNote = () => {
    const note: TastingNote = {
      id: Date.now().toString(),
      spirit_id: 'new',
      spirit_name: newNote.spirit_name,
      spirit_category: newNote.spirit_category,
      date: new Date().toISOString().split('T')[0],
      appearance: newNote.appearance,
      nose: newNote.nose,
      palate: newNote.palate,
      finish: newNote.finish,
      finish_length: newNote.finish_length,
      overall_rating: newNote.overall_rating,
      notes: newNote.notes,
      would_buy_again: newNote.would_buy_again,
      price_paid: newNote.price_paid,
      proof: newNote.proof
    };
    setNotes([note, ...notes]);
    setIsCreating(false);
    setNewNote({
      spirit_name: '',
      spirit_category: 'bourbon',
      appearance: { color: 'amber', clarity: 'brilliant', legs: 'medium' },
      nose: [],
      palate: [],
      finish: '',
      finish_length: 'medium',
      overall_rating: 7,
      notes: '',
      would_buy_again: true,
      price_paid: undefined,
      proof: undefined
    });
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'bourbon': return '🥃';
      case 'scotch': return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
      case 'rye': return '🌾';
      case 'irish': return '🍀';
      case 'japanese': return '🇯🇵';
      default: return '🥃';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/20 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 mb-4 inline-flex items-center gap-2">
            ← Back to BarrelVerse
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-amber-100">
                📝 Tasting Notes
              </h1>
              <p className="text-amber-200/70 text-lg mt-2">
                Document your whiskey journey with AI-assisted descriptors
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + New Tasting
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
            <div className="text-3xl font-bold text-amber-400">{notes.length}</div>
            <div className="text-amber-200/60 text-sm">Total Notes</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
            <div className="text-3xl font-bold text-amber-400">
              {(notes.reduce((sum, n) => sum + n.overall_rating, 0) / notes.length).toFixed(1)}
            </div>
            <div className="text-amber-200/60 text-sm">Avg Rating</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
            <div className="text-3xl font-bold text-amber-400">
              {notes.filter(n => n.would_buy_again).length}
            </div>
            <div className="text-amber-200/60 text-sm">Would Buy Again</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
            <div className="text-3xl font-bold text-amber-400">
              {new Set(notes.map(n => n.spirit_category)).size}
            </div>
            <div className="text-amber-200/60 text-sm">Categories</div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-amber-100 flex items-center gap-2">
                    {getCategoryEmoji(note.spirit_category)} {note.spirit_name}
                  </h3>
                  <p className="text-amber-200/60 text-sm">{note.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{note.overall_rating}</div>
                  <div className="text-amber-200/40 text-xs">/10</div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-amber-200/50 text-xs uppercase mb-1">Nose</p>
                <div className="flex flex-wrap gap-1">
                  {note.nose.slice(0, 4).map((n, i) => (
                    <span key={i} className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs">{n}</span>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-amber-200/50 text-xs uppercase mb-1">Palate</p>
                <div className="flex flex-wrap gap-1">
                  {note.palate.slice(0, 4).map((p, i) => (
                    <span key={i} className="bg-amber-600/20 text-amber-200 px-2 py-0.5 rounded text-xs">{p}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-500/10">
                <span className={`text-sm ${note.would_buy_again ? 'text-green-400' : 'text-red-400'}`}>
                  {note.would_buy_again ? '✓ Would buy again' : '✗ Would not rebuy'}
                </span>
                {note.price_paid && (
                  <span className="text-amber-200/50 text-sm">${note.price_paid}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-amber-500/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-100">New Tasting Note</h2>
                <button onClick={() => setIsCreating(false)} className="text-amber-200/60 hover:text-amber-100 text-2xl">×</button>
              </div>

              {/* Spirit Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-amber-200/60 text-sm mb-1 block">Spirit Name</label>
                  <input
                    type="text"
                    value={newNote.spirit_name}
                    onChange={(e) => setNewNote({ ...newNote, spirit_name: e.target.value })}
                    className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                    placeholder="e.g. Buffalo Trace"
                  />
                </div>
                <div>
                  <label className="text-amber-200/60 text-sm mb-1 block">Category</label>
                  <select
                    value={newNote.spirit_category}
                    onChange={(e) => setNewNote({ ...newNote, spirit_category: e.target.value as any, nose: [], palate: [] })}
                    className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                  >
                    <option value="bourbon">🥃 Bourbon</option>
                    <option value="scotch">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotch</option>
                    <option value="rye">🌾 Rye</option>
                    <option value="irish">🍀 Irish</option>
                    <option value="japanese">🇯🇵 Japanese</option>
                  </select>
                </div>
              </div>

              {/* Appearance */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-100 mb-3">👁️ Appearance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-amber-200/60 text-sm mb-1 block">Color</label>
                    <select
                      value={newNote.appearance.color}
                      onChange={(e) => setNewNote({ ...newNote, appearance: { ...newNote.appearance, color: e.target.value } })}
                      className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-100 text-sm"
                    >
                      {AI_DESCRIPTORS.appearance.colors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-amber-200/60 text-sm mb-1 block">Clarity</label>
                    <select
                      value={newNote.appearance.clarity}
                      onChange={(e) => setNewNote({ ...newNote, appearance: { ...newNote.appearance, clarity: e.target.value } })}
                      className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-100 text-sm"
                    >
                      {AI_DESCRIPTORS.appearance.clarity.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-amber-200/60 text-sm mb-1 block">Legs</label>
                    <select
                      value={newNote.appearance.legs}
                      onChange={(e) => setNewNote({ ...newNote, appearance: { ...newNote.appearance, legs: e.target.value } })}
                      className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-100 text-sm"
                    >
                      {AI_DESCRIPTORS.appearance.legs.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Nose - AI Suggested */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-100 mb-2">
                  👃 Nose <span className="text-amber-400 text-sm font-normal">(AI-suggested for {newNote.spirit_category})</span>
                </h3>
                <p className="text-amber-200/50 text-sm mb-3">Select up to 8 descriptors that match what you smell</p>
                <div className="flex flex-wrap gap-2">
                  {AI_DESCRIPTORS.nose[newNote.spirit_category].map(descriptor => (
                    <button
                      key={descriptor}
                      onClick={() => toggleDescriptor('nose', descriptor)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newNote.nose.includes(descriptor)
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-amber-200/70 hover:bg-gray-600'
                      }`}
                    >
                      {descriptor}
                    </button>
                  ))}
                </div>
                <p className="text-amber-200/40 text-xs mt-2">{newNote.nose.length}/8 selected</p>
              </div>

              {/* Palate - AI Suggested */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-100 mb-2">
                  👅 Palate <span className="text-amber-400 text-sm font-normal">(AI-suggested for {newNote.spirit_category})</span>
                </h3>
                <p className="text-amber-200/50 text-sm mb-3">Select up to 8 descriptors that match what you taste</p>
                <div className="flex flex-wrap gap-2">
                  {AI_DESCRIPTORS.palate[newNote.spirit_category].map(descriptor => (
                    <button
                      key={descriptor}
                      onClick={() => toggleDescriptor('palate', descriptor)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newNote.palate.includes(descriptor)
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-700 text-amber-200/70 hover:bg-gray-600'
                      }`}
                    >
                      {descriptor}
                    </button>
                  ))}
                </div>
                <p className="text-amber-200/40 text-xs mt-2">{newNote.palate.length}/8 selected</p>
              </div>

              {/* Finish */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-100 mb-3">🏁 Finish</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {(['short', 'medium', 'long', 'very_long'] as const).map(length => (
                    <button
                      key={length}
                      onClick={() => setNewNote({ ...newNote, finish_length: length })}
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                        newNote.finish_length === length
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-700 text-amber-200/70 hover:bg-gray-600'
                      }`}
                    >
                      {length.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newNote.finish}
                  onChange={(e) => setNewNote({ ...newNote, finish: e.target.value })}
                  className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 h-20"
                  placeholder="Describe the finish..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {AI_DESCRIPTORS.finish[newNote.spirit_category].map(f => (
                    <button
                      key={f}
                      onClick={() => setNewNote({ ...newNote, finish: newNote.finish ? `${newNote.finish}, ${f}` : f })}
                      className="px-2 py-1 bg-gray-700 text-amber-200/60 rounded text-xs hover:bg-gray-600"
                    >
                      + {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating & Notes */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-amber-200/60 text-sm mb-1 block">Overall Rating</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={newNote.overall_rating}
                      onChange={(e) => setNewNote({ ...newNote, overall_rating: parseFloat(e.target.value) })}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="text-2xl font-bold text-amber-400 w-12">{newNote.overall_rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNote.would_buy_again}
                      onChange={(e) => setNewNote({ ...newNote, would_buy_again: e.target.checked })}
                      className="w-5 h-5 accent-amber-500"
                    />
                    <span className="text-amber-200">Would buy again</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-amber-200/60 text-sm mb-1 block">Price Paid ($)</label>
                  <input
                    type="number"
                    value={newNote.price_paid || ''}
                    onChange={(e) => setNewNote({ ...newNote, price_paid: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-amber-200/60 text-sm mb-1 block">Proof</label>
                  <input
                    type="number"
                    value={newNote.proof || ''}
                    onChange={(e) => setNewNote({ ...newNote, proof: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-amber-200/60 text-sm mb-1 block">Additional Notes</label>
                <textarea
                  value={newNote.notes}
                  onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 h-24"
                  placeholder="Any other thoughts about this whiskey..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-amber-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  disabled={!newNote.spirit_name || newNote.nose.length === 0}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Tasting Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNote(null)}>
          <div 
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
                    {getCategoryEmoji(selectedNote.spirit_category)} {selectedNote.spirit_name}
                  </h2>
                  <p className="text-amber-200/60">{selectedNote.date}</p>
                </div>
                <button onClick={() => setSelectedNote(null)} className="text-amber-200/60 hover:text-amber-100 text-2xl">×</button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-3xl font-bold text-amber-400">{selectedNote.overall_rating}</div>
                  <div className="text-amber-200/50 text-sm">Rating</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-lg font-medium text-amber-100 capitalize">{selectedNote.finish_length.replace('_', ' ')}</div>
                  <div className="text-amber-200/50 text-sm">Finish</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className={`text-lg font-medium ${selectedNote.would_buy_again ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedNote.would_buy_again ? 'Yes' : 'No'}
                  </div>
                  <div className="text-amber-200/50 text-sm">Buy Again</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-amber-400 font-semibold mb-2">👁️ Appearance</h4>
                  <p className="text-amber-200/80">
                    {selectedNote.appearance.color}, {selectedNote.appearance.clarity}, {selectedNote.appearance.legs} legs
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-amber-400 font-semibold mb-2">👃 Nose</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.nose.map((n, i) => (
                      <span key={i} className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">{n}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-amber-400 font-semibold mb-2">👅 Palate</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.palate.map((p, i) => (
                      <span key={i} className="bg-amber-600/20 text-amber-200 px-3 py-1 rounded-full text-sm">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-amber-400 font-semibold mb-2">🏁 Finish</h4>
                  <p className="text-amber-200/80">{selectedNote.finish}</p>
                </div>

                {selectedNote.notes && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-amber-400 font-semibold mb-2">📝 Notes</h4>
                    <p className="text-amber-200/80">{selectedNote.notes}</p>
                  </div>
                )}

                {(selectedNote.price_paid || selectedNote.proof) && (
                  <div className="flex gap-4 text-sm text-amber-200/60">
                    {selectedNote.price_paid && <span>💰 ${selectedNote.price_paid}</span>}
                    {selectedNote.proof && <span>🔥 {selectedNote.proof} proof</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
