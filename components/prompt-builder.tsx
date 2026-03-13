'use client';

import { useState } from 'react';
import { Entry } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Terminal, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptBuilderProps {
  availableEntries: Entry[];
  className?: string;
}

const CLI_FORMATS = [
  {
    id: 'antigravity',
    name: 'Antigravity',
    description: 'Antigravity CLI format',
    template: (items: string[]) => items.map(i => `Use ${i}`).join('\n'),
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Claude Code format',
    template: (items: string[]) => `Please help me with the following:\n\n${items.map(i => `- ${i}`).join('\n')}`,
  },
  {
    id: 'kimi',
    name: 'Kimi',
    description: 'Kimi CLI format',
    template: (items: string[]) => items.join(' | '),
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    description: 'OpenAI Codex format',
    template: (items: string[]) => `Using: ${items.join(', ')}`,
  },
  {
    id: 'generic',
    name: 'Generic',
    description: 'Simple list format',
    template: (items: string[]) => items.map(i => `[${i}]`).join(' '),
  },
];

export function PromptBuilder({ availableEntries, className }: PromptBuilderProps) {
  const [selectedSkills, setSelectedSkills] = useState<Entry[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Entry[]>([]);
  const [cliFormat, setCliFormat] = useState('antigravity');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const skills = availableEntries.filter(e => e.type === 'skill');
  const agents = availableEntries.filter(e => e.type === 'agent');

  const toggleSelection = (entry: Entry) => {
    if (entry.type === 'skill') {
      setSelectedSkills(prev => 
        prev.find(s => s.id === entry.id) 
          ? prev.filter(s => s.id !== entry.id)
          : [...prev, entry]
      );
    } else if (entry.type === 'agent') {
      setSelectedAgents(prev => 
        prev.find(a => a.id === entry.id)
          ? prev.filter(a => a.id !== entry.id)
          : [...prev, entry]
      );
    }
  };

  const removeSelection = (entry: Entry) => {
    if (entry.type === 'skill') {
      setSelectedSkills(prev => prev.filter(s => s.id !== entry.id));
    } else {
      setSelectedAgents(prev => prev.filter(a => a.id !== entry.id));
    }
  };

  const generateCLI = () => {
    const format = CLI_FORMATS.find(f => f.id === cliFormat);
    if (!format) return '';

    const items: string[] = [];
    
    selectedSkills.forEach(skill => {
      items.push(`skill ${skill.slug}`);
    });
    
    selectedAgents.forEach(agent => {
      items.push(`agent ${agent.slug}`);
    });

    let output = format.template(items);
    
    if (customPrompt.trim()) {
      output += `\n\nTask: ${customPrompt}`;
    }

    return output;
  };

  const copyToClipboard = async () => {
    const text = generateCLI();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSelected = (entry: Entry) => {
    if (entry.type === 'skill') {
      return selectedSkills.some(s => s.id === entry.id);
    }
    return selectedAgents.some(a => a.id === entry.id);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Select Skills & Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="skills">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="skills">
                  Skills ({skills.length})
                </TabsTrigger>
                <TabsTrigger value="agents">
                  Agents ({agents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {skills.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => toggleSelection(skill)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border transition-all',
                          isSelected(skill)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-muted hover:border-muted-foreground/30'
                        )}
                      >
                        <div className="font-medium text-sm">{skill.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {skill.ai_explanation?.summary || skill.original_content.slice(0, 100)}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="agents" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {agents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => toggleSelection(agent)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border transition-all',
                          isSelected(agent)
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-muted hover:border-muted-foreground/30'
                        )}
                      >
                        <div className="font-medium text-sm">{agent.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {agent.ai_explanation?.summary || agent.original_content.slice(0, 100)}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Generated Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Items */}
            {(selectedSkills.length > 0 || selectedAgents.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <Badge 
                    key={skill.id} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSelection(skill)}
                  >
                    {skill.title}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedAgents.map(agent => (
                  <Badge 
                    key={agent.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSelection(agent)}
                  >
                    {agent.title}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            {/* CLI Format Selection */}
            <div className="flex flex-wrap gap-2">
              {CLI_FORMATS.map(format => (
                <Button
                  key={format.id}
                  variant={cliFormat === format.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCliFormat(format.id)}
                >
                  {format.name}
                </Button>
              ))}
            </div>

            {/* Custom Prompt */}
            <Textarea
              placeholder="Add your task or custom prompt (optional)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />

            {/* Generated Output */}
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap min-h-[150px]">
                {generateCLI() || 'Select skills or agents to generate a prompt...'}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
                disabled={selectedSkills.length === 0 && selectedAgents.length === 0}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
