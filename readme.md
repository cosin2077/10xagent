# 10行代码实现一个超级自进化 Agent Harness

`for loop + tools + LLM === AI Agent`  
`for loop + tools + LLM + feedback + limitation === Agent Harness`

> 选择个足够强的模型，经历 30～50 轮迭代之后，10xagent.js 将超乎你的想象

```javascript
const call = async messages => { const r = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {
  method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
  body:JSON.stringify({model:process.env.OPENAI_MODEL,messages,tool_choice:"auto",tools:[{type:"function",function:{name:"bash",parameters:{type:"object",properties:{cmd:{type:"string"}},required:["cmd"],additionalProperties:false}}}]})});
  return (await r.json()).choices[0].message; };
const messages=[{role: 'system', content: `你是简洁但十分智能的AI Agent。用 bash 工具执行操作，完成后直接用文本回复。环境信息：\nos=${process.platform}\narch=${process.arch}\ncwd=${process.cwd()}`},{role:"user",content:`${process.argv.slice(2).join(" ")}`}];
for(let i=0;i<30;i++){
  const m=await call(messages);
  if(!m.tool_calls?.length){console.log(m.content);break;}
  messages.push(m,{role:"tool",tool_call_id:m.tool_calls[0].id,content:require('node:child_process').execSync(JSON.parse(m.tool_calls[0].function.arguments).cmd,{encoding:"utf8",timeout:120_000}).slice(0,10_000)});
}
```

## 运行

`.env`(bun 自动加载):

```bash
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-5.5
```

```shell
for i in {1..30}; do echo "=== 第 $i 次 ==="; bun 10xagent.js "你正在将 10xagent.js 从一个极简 Agent 原型，持续优化为一个更完整、更可靠、更安全、更智能的 AI Agent。当前是第 $i/30 轮。每轮只做一个独立、自洽、可独立验证的改进。修改后必须使用 bun 10xagent.js <prompt> 做一次真实端到端验证，验证 prompt 由你根据本轮改动自主设计，必须覆盖本轮改动影响的能力，并确认能正常调用 LLM、使用必要工具、及时返回结果；不要只验证语法或帮助信息，必须验证一个真实任务；如果端到端跑不通或明显卡住，必须回滚本轮改动。"; done
```

- 稍微改动 for in 循环提示词将获得不一样的体验
- 可以加提示词让 Agent 每轮提交 git 记录本轮改动以观察 LLM 的优化思路
- 自进化水平、迭代轮次跟 LLM 智能直接挂钩


> ⚠️ 只用于演示核心原理，权限全权交给LLM，确保 LLM provider 合法可靠，运行风险需要自己把握
