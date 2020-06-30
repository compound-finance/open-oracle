
defmodule Helpers do
  def pad2(num) do
    if num < 10 do
      "0#{num}"
    else
      "#{num}"
    end
  end

  def var(type, num) do
    case type do
      :ctoken -> "cToken#{pad2(num)}"
      :underlying -> "underlying#{pad2(num)}"
      :symbol_hash -> "symbolHash#{pad2(num)}"
      :base_unit -> "baseUnit#{pad2(num)}"
    end
  end

  def split_range(count, tmpl) do
    do_split_range(0, count - 1, tmpl, 4)
  end

  defp do_split_range(start_pos, end_pos, tmpl, min_size) do
    size = end_pos - start_pos
    if size <= min_size do
      start_pos..end_pos
      |> Enum.map(fn(index) -> EEX.eval_string(tmpl[:inner], assigns: [index: index]) end)
      |> Enum.join("\n")
    else
      break = end_pos - floor(size / 2)

      EEX.eval_string(tmpl[:head], assigns: [index: break]) <>
        do_split_range(start_pos, break, tmpl, min_size) <>
        EEX.eval_string(tmpl[:mid], assigns: [index: break]) <>
        do_split_range(break + 1, end_pos, tmpl, min_size) <>
        EEX.eval_string(tmpl[:tail], assigns: [index: break])
    end
  end

  
end

file = "contracts/Config.sol.eex"
result = EEx.eval_file(file, [
  assigns: [count: 30],
],
functions: [
  {Helpers, [var: 2]}
],
trim: true)

File.write!("contracts/Config.sol", result)
