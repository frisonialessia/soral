// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Dialog } from "@/components/ui/dialog";

afterEach(cleanup);

describe("Dialog (a11y)", () => {
  it("no renderiza nada cuando open=false", () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}} label="Test">
        <button>Acción</button>
      </Dialog>
    );
    expect(container.innerHTML).toBe("");
  });

  it("expone role=dialog, aria-modal y nombre accesible", () => {
    render(
      <Dialog open onClose={() => {}} label="Recomendación">
        <button>Acción</button>
      </Dialog>
    );
    const dlg = screen.getByRole("dialog");
    expect(dlg.getAttribute("aria-modal")).toBe("true");
    expect(dlg.getAttribute("aria-label")).toBe("Recomendación");
  });

  it("mueve el foco dentro del diálogo al abrir", () => {
    render(
      <Dialog open onClose={() => {}} label="Test">
        <button>Acción</button>
      </Dialog>
    );
    const dlg = screen.getByRole("dialog");
    expect(dlg.contains(document.activeElement)).toBe(true);
  });

  it("cierra con la tecla Escape", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} label="Test">
        <button>Acción</button>
      </Dialog>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cierra al hacer clic en el backdrop", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} label="Test">
        <button>Acción</button>
      </Dialog>
    );
    const dlg = screen.getByRole("dialog");
    fireEvent.click(dlg.parentElement!); // el backdrop es el contenedor del panel
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
