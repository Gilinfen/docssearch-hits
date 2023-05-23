import * as keys from './changelog.config'

module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
    //   TODO Add Scope Enum Here
    // 'scope-enum': [2, 'always', ['yourscope', 'yourscope']],
        'type-enum': [2, 'always', keys.list],
    },
}
