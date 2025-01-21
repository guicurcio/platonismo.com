"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export interface AdvancedSettings {
  // Basic prompt instructions
  systemMessage: string;
  developerMessage?: string; // Optional "developer" or extra system message

  // Model selection
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-32k";

  // Hyperparameters
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;

  // Additional
  maxTokens?: number;
  stopSequences?: string[];

  // Function calling
  enableFunctions?: boolean;

  // Experimental toggles
  streaming?: boolean;
  debugMode?: boolean;
}

interface AdvancedChatSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  advancedSettings: AdvancedSettings;
  setAdvancedSettings: (settings: AdvancedSettings) => void;
}

export function AdvancedChatSettingsModal({
  isOpen,
  onOpenChange,
  advancedSettings,
  setAdvancedSettings,
}: AdvancedChatSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AdvancedSettings>(
    structuredClone(advancedSettings)
  );

  // Sync local state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(structuredClone(advancedSettings));
    }
  }, [isOpen, advancedSettings]);

  // Helper to handle partial updates
  const handleChange = (partial: Partial<AdvancedSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...partial }));
  };

  // Helper for Sliders
  const handleSliderChange = (
    field: keyof AdvancedSettings,
    value: number[]
  ) => {
    handleChange({ [field]: value[0] });
  };

  // Apply and close
  const handleApply = () => {
    setAdvancedSettings(localSettings);
    onOpenChange(false);
  };

  // Cancel/discard changes
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Reset to defaults
  const handleReset = () => {
    setLocalSettings({
      systemMessage: "You are a helpful assistant.",
      developerMessage: "",
      model: "gpt-4",
      temperature: 0.7,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
      maxTokens: 2000,
      stopSequences: [],
      enableFunctions: false,
      streaming: true,
      debugMode: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Ensure TooltipProvider is present so that <Tooltip> works */}
      <TooltipProvider>
        <DialogContent
          className="bg-popover border text-foreground w-[800px] h-[700px] 
          flex flex-col max-w-[800px]"
        >
          <DialogHeader>
            <DialogTitle>Advanced Chat Settings</DialogTitle>
            <DialogDescription>
              Configure global instructions, model parameters, function-calling,
              and more.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="model" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="model">Model &amp; Hyperparams</TabsTrigger>
              <TabsTrigger value="system">System &amp; Dev Msg</TabsTrigger>
              <TabsTrigger value="functions">Function Calling</TabsTrigger>
              <TabsTrigger value="experimental">Experimental</TabsTrigger>
            </TabsList>

            <div className="relative flex-1 overflow-auto p-4">
              {/* MODEL & HYPERPARAMS */}
              <TabsContent value="model" className="space-y-4">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="model">Model</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Select which OpenAI model to use. Larger models (like
                        GPT-4) can be more capable but also more expensive.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <select
                    id="model"
                    className="border border-input bg-background rounded p-1 w-full"
                    value={localSettings.model}
                    onChange={(e) =>
                      handleChange({
                        model: e.target.value as AdvancedSettings["model"],
                      })
                    }
                  >
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
                    <option value="gpt-4">gpt-4</option>
                  </select>
                </div>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>
                        Temperature: {localSettings.temperature.toFixed(1)}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Controls the randomness of the model’s output. A higher
                        temperature produces more creative or random responses,
                        while a lower temperature is more deterministic.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Slider
                    value={[localSettings.temperature]}
                    onValueChange={(val) =>
                      handleSliderChange("temperature", val)
                    }
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>Top P: {localSettings.topP.toFixed(1)}</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        An alternative to temperature. Top-p sets a threshold to
                        include only the tokens that make up a certain
                        cumulative probability.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Slider
                    value={[localSettings.topP]}
                    onValueChange={(val) => handleSliderChange("topP", val)}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>
                        Presence Penalty:{" "}
                        {localSettings.presencePenalty.toFixed(1)}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Penalizes new tokens if they already appear in the text
                        so far, encouraging the model to discuss new topics.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Slider
                    value={[localSettings.presencePenalty]}
                    onValueChange={(val) =>
                      handleSliderChange("presencePenalty", val)
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>
                        Frequency Penalty:{" "}
                        {localSettings.frequencyPenalty.toFixed(1)}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Penalizes repeated words/phrases, reducing repetition
                        within the output.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Slider
                    value={[localSettings.frequencyPenalty]}
                    onValueChange={(val) =>
                      handleSliderChange("frequencyPenalty", val)
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        The maximum number of tokens (roughly words/pieces of
                        words) in the model’s response. Limits length and cost.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={localSettings.maxTokens ?? 2000}
                    onChange={(e) =>
                      handleChange({ maxTokens: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>Stop Sequences (comma-separated)</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        If any of these sequences appear in the response, the
                        generation stops immediately.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    value={(localSettings.stopSequences || []).join(", ")}
                    onChange={(e) =>
                      handleChange({
                        stopSequences: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </TabsContent>

              {/* SYSTEM & DEVELOPER MESSAGES */}
              <TabsContent value="system" className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="systemMessage">System Message</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        High-level instruction given to the model at the start
                        of every conversation. Useful for controlling style or
                        role.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Textarea
                    id="systemMessage"
                    value={localSettings.systemMessage}
                    onChange={(e) =>
                      handleChange({ systemMessage: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="developerMessage">
                        Developer Message <span className="text-xs text-muted-foreground">(optional)</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Additional system-level instructions to further refine
                        or constrain the model’s responses.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Textarea
                    id="developerMessage"
                    placeholder="Additional instructions for the model..."
                    value={localSettings.developerMessage || ""}
                    onChange={(e) =>
                      handleChange({ developerMessage: e.target.value })
                    }
                  />
                </div>
              </TabsContent>

              {/* FUNCTION CALLING */}
              <TabsContent value="functions" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch
                        checked={!!localSettings.enableFunctions}
                        // If your TS complains about `CheckedState` vs boolean, you can coerce with Boolean():
                        onCheckedChange={(val) =>
                          handleChange({ enableFunctions: Boolean(val) })
                        }
                        id="enableFunctions"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Allows the AI to call predefined functions (like 
                        external APIs, utility scripts, etc.) as needed.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="enableFunctions">
                    Enable Function Calling
                  </Label>
                </div>

                {localSettings.enableFunctions && (
                  <div className="border p-3 rounded space-y-2">
                    <p className="text-sm text-muted-foreground">
                      You can define or manage function calls for the model
                      here.
                    </p>
                    <Button variant="secondary" size="sm">
                      Manage Functions
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* EXPERIMENTAL */}
              <TabsContent value="experimental" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        id="streaming"
                        checked={!!localSettings.streaming}
                        // Coerce `CheckedState` -> boolean
                        onCheckedChange={(checked) =>
                          handleChange({ streaming: Boolean(checked) })
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        If enabled, responses can be streamed token-by-token.
                        Disable if your environment does not support streaming.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="streaming">Enable Streaming</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        id="debugMode"
                        checked={!!localSettings.debugMode}
                        onCheckedChange={(checked) =>
                          handleChange({ debugMode: Boolean(checked) })
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Adds extra logging or debugging output when the model is
                        called. Helpful for development or troubleshooting.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="debugMode">Enable Debug Mode</Label>
                </div>

                <p className="text-sm text-muted-foreground">
                  Additional experimental flags or toggles can be placed here.
                </p>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <div className="flex w-full items-center justify-between">
              <Button variant="ghost" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                {/* UPDATED: variant=\"primary\" now works because we defined 'primary' in button.tsx */}
                <Button variant="primary" onClick={handleApply}>
                  Save &amp; Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </TooltipProvider>
    </Dialog>
  );
}
