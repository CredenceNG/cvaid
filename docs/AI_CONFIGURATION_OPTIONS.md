# AI Model and Prompt Configuration Options

This document outlines the various options and approaches for making the AI model and prompts configurable in the Resume Optimizer application.

## Current State

- **AI Provider**: Google Gemini
- **Model**: `gemini-2.0-flash-exp` (hardcoded)
- **Configuration**: API key via environment variable (`GEMINI_API_KEY`)
- **Prompts**: Hardcoded in `app/api/analyze/route.ts` (lines 28-78)

## Configuration Options to Consider

### 1. Model Provider Flexibility

#### Option A: Single Provider (Current)
- Keep using only Google Gemini
- Make model name configurable
- Simpler implementation
- Lower maintenance overhead

#### Option B: Multi-Provider Support
- Support multiple AI providers:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude 3 Opus, Sonnet, Haiku)
  - Google Gemini (various models)
  - Azure OpenAI
  - Local models (Ollama, etc.)
- Provider selection via configuration
- Requires abstraction layer for different APIs
- More flexibility but higher complexity

### 2. Configuration Interface

#### Option A: Environment Variables Only
- Store all settings in `.env` file
- Simple, no UI needed
- Good for server-side configuration
- Requires server restart for changes
- Example:
  ```env
  AI_PROVIDER=gemini
  AI_MODEL=gemini-2.0-flash-exp
  AI_TEMPERATURE=0.7
  AI_MAX_TOKENS=2000
  ```

#### Option B: Admin UI (Database-backed)
- Web interface for configuration
- Real-time updates without restart
- User-friendly for non-technical admins
- Requires database schema and admin pages
- Can include validation and testing tools

#### Option C: Configuration File
- JSON, YAML, or TypeScript config file
- Version controlled
- Easy to backup and restore
- Can include comments and documentation
- Example structure:
  ```typescript
  // config/ai-config.ts
  export const aiConfig = {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 2000,
    prompts: {
      resumeAnalysis: 'templates/resume-analysis.txt'
    }
  }
  ```

#### Option D: Hybrid Approach
- Secrets (API keys) in environment variables
- Other settings in config file or database
- Best of both worlds
- Common in production applications

### 3. Prompt Customization Level

#### Option A: Full Template Editing
- Store entire prompt as configurable text
- Maximum flexibility
- Can break if not properly formatted
- Requires understanding of prompt engineering
- Storage: Database, file system, or admin UI

#### Option B: Parameterized Prompts
- Keep core prompt structure fixed
- Make specific parts configurable:
  - Tone (professional, casual, friendly)
  - Expertise level (beginner, intermediate, expert)
  - Output format preferences
  - Section order and inclusion
- Safer than full editing
- Still allows meaningful customization

#### Option C: Preset Prompt Templates
- Multiple pre-built templates:
  - "Professional Resume Review"
  - "Executive Career Coaching"
  - "Entry-Level Job Seeker"
  - "Career Transition"
  - "Technical Roles"
- Select from dropdown
- Easy to use
- Limited flexibility

#### Option D: Advanced Prompt Editor
- Visual editor with:
  - Variable placeholders (`{{resume}}`, `{{goals}}`)
  - Section toggle (enable/disable sections)
  - Preview functionality
  - Template validation
  - Version history
- Best user experience
- Most complex to build

### 4. Settings Scope

#### Option A: Global Settings (Admin-controlled)
- Single configuration for entire application
- All users get same experience
- Simpler to manage
- Consistent results
- Admin panel required

#### Option B: Per-User Settings
- Each user customizes their own:
  - Preferred model
  - Prompt style
  - Output preferences
- Requires user database/profiles
- More personalized experience
- Higher resource usage

#### Option C: Both (Tiered)
- Global defaults set by admin
- Users can override specific settings
- Fallback to global if user doesn't customize
- Most flexible
- More complex permission model

### 5. Model Parameters

#### Option A: Model Name Only
- Minimal configuration
- Use provider defaults for other parameters
- Simplest implementation

#### Option B: Core Parameters
- Model name
- Temperature (0.0-1.0) - controls randomness/creativity
- Max tokens - response length limit
- Common across most providers

#### Option C: Advanced Parameters
All of the above plus:
- Top-p (nucleus sampling)
- Top-k (vocabulary truncation)
- Frequency penalty
- Presence penalty
- Stop sequences
- System message customization
- Streaming options

## Implementation Patterns

### Abstraction Layer Example

```typescript
interface AIProvider {
  generateContent(prompt: string, options: GenerateOptions): Promise<string>;
  validateConfig(): boolean;
  getAvailableModels(): string[];
}

class GeminiProvider implements AIProvider {
  // Implementation
}

class OpenAIProvider implements AIProvider {
  // Implementation
}
```

### Configuration Schema Example

```typescript
interface AIConfiguration {
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  parameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
  prompts: {
    resumeAnalysis: PromptTemplate;
  };
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  version: number;
}
```

### Storage Options

1. **Environment Variables**: `.env` file
2. **Config File**: `config/ai-settings.json` or `.ts`
3. **Database Tables**:
   - `ai_configurations` (global settings)
   - `user_ai_preferences` (per-user overrides)
   - `prompt_templates` (reusable prompts)
4. **Hybrid**: API keys in env, settings in DB

## Migration Considerations

- Backward compatibility with existing resume analysis
- Data migration for existing users
- Fallback mechanisms if configuration fails
- Validation and error handling
- Cost monitoring across different providers
- Rate limiting per provider

## Security Considerations

- API key storage (never in version control)
- Access control for admin settings
- Prompt injection prevention
- Input validation and sanitization
- Audit logging for configuration changes
- API key rotation procedures

## Testing Implications

- Mock different providers in tests
- Validate prompt templates
- Test configuration validation
- Performance testing with different models
- Cost simulation tools

## Recommended Approach Decision Tree

1. **Start Small**: Environment variables for model/params
2. **Add Templates**: Config file with prompt templates
3. **Scale Up**: Admin UI if needed for business users
4. **Advanced**: Multi-provider support when required

## Cost Implications

Different providers and models have varying costs:
- OpenAI GPT-4: Higher cost, best quality
- OpenAI GPT-3.5: Lower cost, good quality
- Anthropic Claude: Competitive pricing, long context
- Google Gemini: Often lower cost or free tiers
- Local models: Infrastructure cost, no per-token cost

Configuration should consider budget constraints.

## Monitoring and Analytics

- Track which models/providers are used
- Monitor response times
- Measure token usage and costs
- Quality metrics (user satisfaction)
- Error rates per provider

---

**Document Version**: 1.0
**Last Updated**: 2025-10-24
**Related Files**:
- [app/api/analyze/route.ts](../app/api/analyze/route.ts)
- [.env.example](../.env.example)
