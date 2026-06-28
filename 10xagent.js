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