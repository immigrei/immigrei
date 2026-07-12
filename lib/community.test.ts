import { describe, expect, it } from "vitest";
import { findContactInfo } from "./community";

describe("findContactInfo", () => {
  it("blocks emails", () => {
    expect(findContactInfo("me escreve em fulano@gmail.com")).toBe("email");
    expect(findContactInfo("contato: a.b+niw@empresa.com.br")).toBe("email");
  });

  it("blocks BR and US phone numbers", () => {
    expect(findContactInfo("liga (407) 555-0134")).toBe("telefone");
    expect(findContactInfo("+55 11 98765-4321 a qualquer hora")).toBe("telefone");
    expect(findContactInfo("meu numero 11 98765 4321")).toBe("telefone");
  });

  it("blocks links and shorteners", () => {
    expect(findContactInfo("agenda em https://calendly.com/x")).toBe("link");
    expect(findContactInfo("entra no wa.me/5511987654321")).toBe("link");
    expect(findContactInfo("veja www.meusite.com")).toBe("link");
  });

  it("blocks social handles and contact-me phrases", () => {
    expect(findContactInfo("me acha no insta @fulano.oficial")).toBe("rede social");
    expect(findContactInfo("me chama no zap que te explico")).toBe("rede social");
    expect(findContactInfo("manda DM que eu ajudo")).toBe("rede social");
  });

  it("allows normal immigration stories", () => {
    expect(
      findContactInfo(
        "Enviei o I-539 em outubro de 2025 e a biometria saiu em dezembro. " +
          "Paguei $470 de taxa e esperei 7 meses. A entrevista durou 5 minutos."
      )
    ).toBeNull();
    expect(findContactInfo("Meu processo custou R$ 1.500,00 no total")).toBeNull();
    expect(findContactInfo("Cheguei em 2019 e apliquei em 2024")).toBeNull();
  });
});
