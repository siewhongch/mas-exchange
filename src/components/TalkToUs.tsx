import React, { useState } from 'react';
import { DiscussionEmbed, CommentCount } from 'disqus-react';
import { MessageSquare, Globe2, ShieldAlert, Sparkles, HelpCircle, Send } from 'lucide-react';

interface ArticleTopic {
  id: string;
  title: string;
  description: string;
  category: string;
}

const TOPICS: ArticleTopic[] = [
  {
    id: 'mas-exchanger-general',
    title: 'Talk to Us - Community Q&A & Feedback',
    description: 'Share your questions, feedback, or rate inquiries with our Singapore forex community.',
    category: 'Community',
  },
  {
    id: 'mas-exchanger-moneychangers',
    title: 'Singapore Money Changers & Travel FX Tips',
    description: 'Discuss rates at The Arcade Raffles Place, Mustafa Centre, Johor Bahru border tips, and card spreads.',
    category: 'Travel & Cash',
  },
  {
    id: 'mas-exchanger-mas-api',
    title: 'MAS API & Developer Integration Discussion',
    description: 'Questions and implementation tips for connecting to the MAS daily exchange rates catalogue.',
    category: 'Developer',
  },
];

export const TalkToUs: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<ArticleTopic>(TOPICS[0]);
  const [language, setLanguage] = useState<'en' | 'zh_TW'>('en');

  // Dynamic URL resolution with graceful fallback
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mas-exchanger.web.app';
  const currentUrl = `${baseUrl}/talk-to-us/${selectedTopic.id}`;

  const disqusConfig = {
    url: currentUrl,
    identifier: selectedTopic.id,
    title: selectedTopic.title,
    language: language,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Community Forum</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                <CommentCount shortname="mas-exchanger" config={disqusConfig}>
                  Comments
                </CommentCount>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Talk to Us
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Welcome to the Singapore currency exchange discussion board. Ask questions, report rate discrepancies, share Johor Bahru / travel money-changer tips, or get help with the MAS API.
            </p>
          </div>

          {/* Language selector toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-slate-100 p-1 rounded-lg text-xs">
            <Globe2 className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('zh_TW')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'zh_TW'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              繁體中文
            </button>
          </div>
        </div>

        {/* Topic Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Select Discussion Channel:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TOPICS.map((topic) => {
              const isSelected = topic.id === selectedTopic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold block mb-0.5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {topic.category}
                  </span>
                  <span className="text-xs font-bold block truncate">
                    {topic.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Topic Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-slate-900 block">{selectedTopic.title}</span>
          <span className="text-slate-500">{selectedTopic.description}</span>
        </div>
        <div className="text-slate-500 shrink-0 font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-slate-200">
          Thread ID: {selectedTopic.id}
        </div>
      </div>

      {/* Disqus Discussion Embed Container */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs min-h-[420px]">
        {/* Ad blocker or privacy browser notice */}
        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Powered by Disqus (shortname: <strong className="font-mono text-slate-700">mas-exchanger</strong>). If the comments frame does not appear below, please check if your browser tracking protection or ad-blocker is temporarily disabling third-party embed widgets.
          </span>
        </div>

        {/* The Disqus Forum Embed */}
        <div className="disqus-container">
          <DiscussionEmbed
            shortname="mas-exchanger"
            config={disqusConfig}
          />
        </div>
      </div>
    </div>
  );
};
