module.exports = {
  types: [
    { value: ':rocket: feat', name: 'feat:     新特性' },
    { value: ':bug: fix', name: 'fix:      修复bug' },
    { value: ':memo: docs', name: 'docs:     文档/注释变更' },
    {
      value: ':art:style',
      name:
        'style:    调整样式',
    },
    {
      value: ':hammer: refactor',
      name: 'refactor: 功能重构',
    },
    { value: ':tada: publish', name: 'publish:   发布新版本' },
    { value: ':arrow_down: revert', name: 'revert:   代码回退' },
    { value: ':construction: ci', name: 'ci:      触发ci构建' },
  ],

  // scopes: [{ name: 'accounts' }, { name: 'admin' }, { name: 'exampleScope' }, { name: 'changeMe' }], 

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: 'TICKET-',
  ticketNumberRegExp: '\\d{1,5}',

  // it needs to match the value for field type. Eg.: 'fix' 
  /* 
  scopeOverrides: {
    fix: [

      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: "选择要提交的更改类型:",
    scope: '\n影响范围 (可选):',
    // used if allowCustomScopes is true
    customScope: '影响范围 (可选):',
    subject: '变更内容的简要描述(100字以内):\n',
    body: '变更内容的详细说明 (可选). 使用 "|" 换行:\n',
    breaking: '不兼容变更(可选):\n',
    footer: '关闭的ISSUE (可选). 如: #31, #34:\n',
    confirmCommit: '确定提交以上变动?',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  // skip any questions you want
  skipQuestions: ['body'],

  // limit subject length
  subjectLimit: 100,
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};
