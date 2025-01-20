import { useState, useEffect } from "react";
import {
  IconButton,
  Tooltip,
  Typography,
  Stack,
  TextField,
  Icon,
} from "@mui/material";
import { useConnections } from "hooks/use-connections";
import { useSubscribe } from "hooks/use-pubsub";
import { CodeViewer } from "components/CodeViewer";
import { ClipCopy } from "components/ClipCopy";
import { ClipPaste } from "components/ClipPaste";
import { buildListTablesPropmt, buildText2SQLPrompt } from "./prompts";

const useDBInfo = () => {
  const { getDBInfo } = useConnections();
  const [data, setData] = useState(getDBInfo());
  useSubscribe("dbinfo:updated", setData);
  return data;
};

const estimateLLMTokens = (input: string | JSON): number => {
  // Convert the JSON object to a string
  const jsonString = typeof input === "string" ? input : JSON.stringify(input);

  // Roughly estimate the number of tokens based on the length of the string
  // Assuming 4 characters per token on average (a common heuristic)
  const avgCharsPerToken = 4;

  return Math.ceil(jsonString.length / avgCharsPerToken);
};

const calculateCost =
  (model: "GPT-4o" | "GPT-4o Mini" | "o1" | "o1-mini") =>
  (_tokens: number | string | JSON, balancedOutput: number = 10): string => {
    // Define cost per 1M tokens for each model
    const pricing = {
      "GPT-4o": { input: 5.0, output: 15.0 },
      "GPT-4o Mini": { input: 0.15, output: 0.6 },
      o1: { input: 15.0, output: 60.0 },
      "o1-mini": { input: 3.0, output: 12.0 },
    };

    // Retrieve the selected model's pricing
    const modelPricing = pricing[model];
    console.log("modelPricing", modelPricing);

    // Calculate the number of input and output tokens
    const tokens =
      typeof _tokens === "number" ? _tokens : estimateLLMTokens(_tokens);
    const outputTokens = (tokens * balancedOutput) / 100;
    const inputTokens = tokens - outputTokens;

    // Calculate the cost per token in USD
    const inputCostPerToken = modelPricing.input / 1000000;
    const outputCostPerToken = modelPricing.output / 1000000;

    // Compute the total cost
    const totalCost =
      inputTokens * inputCostPerToken + outputTokens * outputCostPerToken;

    // Return the cost as a string, formatted to two decimal places
    return totalCost < 0.01 ? "<0.01" : totalCost.toFixed(2);
  };

export const Text2SQLView = () => {
  const dbInfo = useDBInfo();
  const [prompt1Request, setPrompt1Request] = useState(
    "List the categories with the last rented movie"
  );
  const [prompt1Expanded, setPrompt1Expanded] = useState(false);
  const [prompt1Response, setPrompt1Response] = useState(``);
  const [prompt1ResponseExpanded, setPrompt1ResponseExpanded] = useState(false);

  const [prompt2Request, setPrompt2Request] = useState("");
  const [prompt2Expanded, setPrompt2Expanded] = useState(false);
  const [prompt2Response, setPrompt2Response] = useState(``);
  const [prompt2ResponseExpanded, setPrompt2ResponseExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  // Parse the answer from the first prompt:
  useEffect(() => {
    if (!dbInfo) return;
    if (!prompt1Response.length) return;

    try {
      const data = JSON.parse(prompt1Response);

      if (data.step === "sql") {
        if (data.query && data.rate === 1) {
          setQuery(data.query);
        } else {
          console.log("move to next prompt");

          const ctx = [
            ...dbInfo?.ai.full.tables
              .filter((t: any) => data.tables.includes(t.name))
              .map(({ partitions, ...$ }: any) => $),
            ...dbInfo?.ai.full.views
              .filter((t: any) => data.tables.includes(t.name))
              .map(({ partitions, ...$ }: any) => $),
            ...dbInfo?.ai.full.materialized
              .filter((t: any) => data.tables.includes(t.name))
              .map(({ partitions, ...$ }: any) => $),
          ];

          setPrompt2Request(buildText2SQLPrompt(prompt1Request, ctx));
        }
      }

      if (data.step === "input") {
        setInput(data.answer);
      }

      if (data.step === "answer") {
        setAnswer(data.answer);
      }
    } catch (e: any) {
      alert(e.message);
    }
  }, [dbInfo, prompt1Request, prompt1Response]);

  // Parse the answer from the second prompt:
  useEffect(() => {
    if (!dbInfo) return;
    if (!prompt2Response.length) return;

    try {
      const data = JSON.parse(prompt2Response);
      setQuery(data.query);
    } catch (e: any) {
      alert(e.message);
    }
  }, [dbInfo, prompt2Request, prompt2Response]);

  return (
    <Stack p={2} spacing={4}>
      {/* Request */}
      <Stack spacing={1}>
        <Typography variant="h3">1. State your request</Typography>
        <TextField
          size={"small"}
          value={prompt1Request}
          onChange={(e) => setPrompt1Request(e.target.value)}
          placeholder="List the top 10 actors by revenue"
          multiline
          rows={3}
        />
      </Stack>
      {/* Prompt1 - Clip */}
      {prompt1Request.length === 0 ? null : (
        <Stack spacing={1}>
          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h3" flexGrow={1}>
              2. Copy the first prompt
            </Typography>
            <Stack direction={"row"} spacing={1}>
              <Typography variant="caption">
                ~
                {estimateLLMTokens(
                  buildListTablesPropmt(prompt1Request, dbInfo?.ai.compact)
                )}
                {" tokens; "}
                <small>
                  {calculateCost("GPT-4o Mini")(
                    buildListTablesPropmt(prompt1Request, dbInfo?.ai.compact)
                  )}
                  {" cents"}
                </small>
              </Typography>
            </Stack>
            <Tooltip title="Expand prompt source code">
              <IconButton onClick={() => setPrompt1Expanded((v) => !v)}>
                <Icon>code</Icon>
              </IconButton>
            </Tooltip>
            <ClipCopy
              content={buildListTablesPropmt(
                prompt1Request,
                dbInfo?.ai.compact
              )}
            />
          </Stack>
          {prompt1Expanded && (
            <TextField
              fullWidth
              value={buildListTablesPropmt(prompt1Request, dbInfo?.ai.compact)}
              size={"small"}
              slotProps={{ input: { readOnly: true } }}
              rows={5}
              multiline
            />
          )}
        </Stack>
      )}
      {/* Prompt1 - Response */}
      {prompt1Request.length === 0 ? null : (
        <Stack spacing={1}>
          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h3" flexGrow={1}>
              3. Paste LLM Response
            </Typography>
            {prompt1Response.length === 0 ? null : (
              <Tooltip title="Expand LLM response">
                <IconButton
                  onClick={() => setPrompt1ResponseExpanded((v) => !v)}
                >
                  <Icon>code</Icon>
                </IconButton>
              </Tooltip>
            )}
            <ClipPaste onChange={setPrompt1Response} />
          </Stack>
          {prompt1ResponseExpanded && (
            <TextField
              size={"small"}
              value={prompt1Response}
              onChange={(e) => setPrompt1Response(e.target.value)}
              multiline
              rows={3}
            />
          )}
        </Stack>
      )}
      {/* Prompt2 - Request */}
      {prompt2Request.length === 0 ? null : (
        <Stack spacing={1}>
          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h3" flexGrow={1}>
              4. Copy the second prompt
            </Typography>
            <Stack direction={"row"} spacing={1}>
              <Typography variant="caption">
                ~{estimateLLMTokens(prompt2Request)}
                {" tokens; "}
                <small>
                  {calculateCost("GPT-4o")(prompt2Request)}
                  {" cents"}
                </small>
              </Typography>
            </Stack>
            <Tooltip title="Expand prompt source code">
              <IconButton onClick={() => setPrompt2Expanded((v) => !v)}>
                <Icon>code</Icon>
              </IconButton>
            </Tooltip>
            <ClipCopy content={prompt2Request} />
          </Stack>
          {prompt2Expanded && (
            <TextField
              fullWidth
              value={prompt2Request}
              size={"small"}
              slotProps={{ input: { readOnly: true } }}
              rows={5}
              multiline
            />
          )}
        </Stack>
      )}
      {/* Prompt2 - Response */}
      {prompt2Request.length === 0 ? null : (
        <Stack spacing={1}>
          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h3" flexGrow={1}>
              5. Paste LLM Response
            </Typography>
            {prompt2Response.length === 0 ? null : (
              <Tooltip title="Expand LLM response">
                <IconButton
                  onClick={() => setPrompt2ResponseExpanded((v) => !v)}
                >
                  <Icon>code</Icon>
                </IconButton>
              </Tooltip>
            )}
            <ClipPaste onChange={setPrompt2Response} />
          </Stack>
          {prompt2ResponseExpanded && (
            <TextField
              size={"small"}
              value={prompt2Response}
              onChange={(e) => setPrompt2Response(e.target.value)}
              multiline
              rows={3}
            />
          )}
        </Stack>
      )}
      {/* SQL Query */}
      {query.length === 0 ? null : (
        <Stack spacing={1}>
          <Typography variant="h3">🧑‍💻 SQL Query</Typography>
          <CodeViewer code={query} language="sql" height={200} />
        </Stack>
      )}
      {/* Input */}
      {input.length === 0 ? null : (
        <Stack spacing={1}>
          <Typography variant="h3">🧨 Need more input</Typography>
          <Typography variant="body1">{input}</Typography>
        </Stack>
      )}
      {/* Answer */}
      {answer.length === 0 ? null : (
        <Stack spacing={1}>
          <Typography variant="h3">😎 Here you go:</Typography>
          <Typography variant="body1">{answer}</Typography>
        </Stack>
      )}
    </Stack>
  );
};
