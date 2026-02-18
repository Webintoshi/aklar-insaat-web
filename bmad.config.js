/**
 * BMAD Method V6 Configuration
 * Aklar İnşaat - Next.js Project
 * https://github.com/bmad-code-org/BMAD-METHOD
 */

module.exports = {
  // Project Info
  project: {
    name: 'Aklar İnşaat',
    description: 'Modern Konut Projeleri ve İnşaat Çözümleri',
    type: 'nextjs',
    language: 'tr',
  },

  // BMAD Core Settings
  bmad: {
    version: '6.0.1',
    module: 'bmm',
    tools: ['claude-code'],
    outputFolder: '_bmad-output',
  },

  // AI Agent Configuration
  agents: {
    architect: {
      name: 'BMAD Architect',
      role: 'Technical Architect & Code Reviewer',
      expertise: ['nextjs', 'react', 'typescript', 'tailwind', 'supabase'],
    },
    developer: {
      name: 'BMAD Developer', 
      role: 'Full-Stack Developer',
      expertise: ['frontend', 'backend', 'database', 'api'],
    },
    qa: {
      name: 'BMAD QA',
      role: 'Quality Assurance & Testing',
      expertise: ['testing', 'e2e', 'performance', 'security'],
    },
  },

  // Workflow Configuration
  workflows: {
    default: 'agile-ai',
    agile: {
      phases: ['requirements', 'design', 'implementation', 'testing', 'deployment'],
      iterations: true,
      reviewPoints: true,
    },
  },

  // Module Settings (BMM - BMad Method Module)
  modules: {
    bmm: {
      enabled: true,
      features: {
        codeGeneration: true,
        codeReview: true,
        documentation: true,
        testing: true,
      },
    },
  },

  // Tool Integrations
  tools: {
    'claude-code': {
      enabled: true,
      contextWindow: 200000,
      features: {
        inlineEditing: true,
        terminalAccess: true,
        fileOperations: true,
      },
    },
  },

  // Code Standards
  standards: {
    typescript: true,
    strictMode: true,
    linting: 'eslint',
    formatting: 'prettier',
    git: {
      conventionalCommits: true,
      branchNaming: true,
    },
  },

  // Ignore Patterns
  ignore: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '_bmad-output',
    '*.log',
    '.env*',
    'package-lock.json',
    'pnpm-lock.yaml',
  ],
};
