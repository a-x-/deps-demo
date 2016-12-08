const bemdecl = require('bem-decl/lib/normalize')
const nodeEval = require('node-eval')
// const util = require('util')
const stringify = json => JSON.stringify(json, null, 4) // util.inspect { depth: null, maxArrayLength: null }
const $ = selector => document.querySelector(selector)
const $$ = selector => Array.from(document.querySelectorAll(selector))
const omit = require('lodash/omit')

const $status = $('.status')
const $input = document.getElementById('input')
const $output = document.getElementById('output')
const $examples = $('.examples')

const log = args => ($status.innerHTML = args.toString(), $status.classList.remove('_ok'), $status.classList.remove('_error'))
const error = args => ($status.innerHTML = args.toString(), $status.classList.remove('_ok'), $status.classList.add('_error'))
const success = args => ($status.innerHTML = args.toString(), $status.classList.add('_ok'), $status.classList.remove('_error'))

const onOutput = val => {console.info('ok'); localStorage.setItem('input', $input.value)}
const output = val => {$output.value = val; onOutput(val)}
const onInput = () => {
    try {
        const builtDeps = bemdecl(nodeEval(`(${$input.value})`))
        const builtDeps_ = builtDeps.map(item => Object.assign({}, item.entity, omit(item, 'entity')))
        output(stringify(builtDeps_))
    } catch(e) {console.error(e);}
}

$input.value = localStorage.getItem('input')
onInput()

// Без try catch этот код почему-то не работает  ¯\_(ツ)_/¯
try{
    (function (_log, _error, _info) {
        // console.log = arg => {_log(arg); log(arg)}
        console.error = arg => {_error(arg); error(arg)}
        console.info = arg => {_info(arg); success(arg)}
    })(console.log, console.error, console.info)
}catch(e){console.error('wtf', e);}

$input.addEventListener('input', onInput)

const onExitExamples = () => {
    $examples.classList.add('_hidden');
    $$('.main').forEach(el=>el.classList.remove('_inactive'));
}

// todo: переписать на какой-нибудь популярный роутер
const go = (uri, link) => {
    console.log('go', uri);
    switch(uri) {
        case '/examples': history.pushState({}, 'examples', '#!'+uri); $examples.classList.remove('_hidden'); $$('.main').forEach(el=>el.classList.add('_inactive')); break;
        case '/example': $input.value = link&&link.dataset.content; console.log('link.dataset.content', link.dataset.content); onInput(); console.log('done', link, uri); location.hash === '#!/examples' && onExitExamples(); history.pushState({}, 'example', '/'); break;
        case '/': location.hash === '#!/examples' && onExitExamples(); history.pushState({}, $('title').innerHTML, '#!'+uri); break;
        defalut: history.replaceState({},'404','#!/404')
    }
}

$$('a').forEach(a => a.onclick = e => {e.preventDefault(); go(new URL(e.target.href).pathname, e.target); return false})

const initPage = () => {
    go(location.hash.replace('#!',''))
}

initPage()


