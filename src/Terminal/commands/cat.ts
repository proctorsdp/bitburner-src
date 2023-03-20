import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { showMessage } from "../../Message/MessageHelpers";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { getEnumHelper } from "../../utils/helpers/enum";
import { MessageFilenames } from "../../data/HiddenEnums";

export function cat(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 1) return Terminal.error("Incorrect usage of cat command. Usage: cat [file]");
  const relative_filename = args[0] + "";
  const filename = Terminal.getFilepath(relative_filename);
  if (
    !filename.endsWith(".msg") &&
    !filename.endsWith(".lit") &&
    !filename.endsWith(".txt") &&
    !filename.endsWith(".script") &&
    !filename.endsWith(".js")
  ) {
    return Terminal.error(
      "Only .msg, .txt, .lit, .script and .js files are viewable with cat (filename must end with .msg, .txt, .lit, .script or .js)",
    );
  }

  if (filename.endsWith(".msg") || filename.endsWith(".lit")) {
    if (!server.messages.includes(filename)) return Terminal.error(`No such file ${filename}`);
    if (getEnumHelper(MessageFilenames).isMember(filename)) return showMessage(filename);
    if (filename.endsWith(".lit")) return showLiterature(filename);
    return Terminal.error(".msg file exists but is not detected as a valid message. This is a bug.");
  } else if (filename.endsWith(".txt")) {
    const txt = Terminal.getTextFile(relative_filename);
    if (txt) return txt.show();
  } else if (filename.endsWith(".script") || filename.endsWith(".js")) {
    const script = Terminal.getScript(relative_filename);
    if (script) return dialogBoxCreate(`${script.filename}\n\n${script.code}`);
  }

  Terminal.error(`No such file ${filename}`);
}
