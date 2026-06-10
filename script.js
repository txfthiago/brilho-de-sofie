const leadForm = document.querySelector(".lead-form");
const phoneInput = leadForm?.querySelector('input[name="telefone"]');
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const revealItems = document.querySelectorAll(
  ".hero-copy, .split > div:first-child, .category-card, .lookbook img, .promise-copy, .promise-list article, .founder img, .founder div, .lead-copy, .lead-form"
);

const googleFormsConfig = {
  formActionUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSdycemqmBN4lWBtNpdEqlHkeIjLQoN1M7ErUk4DhFfIvQNt7g/formResponse",
  fields: {
    nome: "entry.778559582",
    email: "entry.1370430074",
    telefone: "entry.479336770",
    interesses: "entry.667922986",
  },
};

revealItems.forEach((item, index) => {
  item.classList.add("reveal");

  if (index % 3 === 1) {
    item.classList.add("delay-1");
  }

  if (index % 3 === 2) {
    item.classList.add("delay-2");
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (leadForm) {
  const fields = {
    nome: leadForm.querySelector('input[name="nome"]'),
    email: leadForm.querySelector('input[name="email"]'),
    telefone: leadForm.querySelector('input[name="telefone"]'),
  };

  const showError = (fieldName, message) => {
    const field = fields[fieldName];
    const error = leadForm.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) {
      return;
    }

    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
    error.classList.toggle("is-visible", Boolean(message));
  };

  const showStatus = (message, type) => {
    const status = leadForm.querySelector(".form-status");

    if (!status) {
      return;
    }

    status.textContent = message;
    status.classList.toggle("is-visible", Boolean(message));
    status.classList.toggle("is-success", type === "success");
    status.classList.toggle("is-error", type === "error");
  };

  const googleFormsIsConfigured = () => {
    return Boolean(
      googleFormsConfig.formActionUrl &&
        googleFormsConfig.fields.nome &&
        googleFormsConfig.fields.email &&
        googleFormsConfig.fields.telefone &&
        googleFormsConfig.fields.interesses
    );
  };

  const submitToGoogleForms = async (formData, interests) => {
    const googlePayload = new FormData();

    googlePayload.append(googleFormsConfig.fields.nome, formData.get("nome") || "");
    googlePayload.append(googleFormsConfig.fields.email, formData.get("email") || "");
    googlePayload.append(googleFormsConfig.fields.telefone, formData.get("telefone") || "");
    googlePayload.append(
      googleFormsConfig.fields.interesses,
      interests.length ? interests.join(", ") : "não informado"
    );

    await fetch(googleFormsConfig.formActionUrl, {
      method: "POST",
      mode: "no-cors",
      body: googlePayload,
    });
  };

  const validateLeadForm = () => {
    const nameParts = fields.nome.value.trim().split(/\s+/).filter(Boolean);
    const phoneDigits = fields.telefone.value.replace(/\D/g, "");
    const email = fields.email.value.trim();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    let isValid = true;

    if (nameParts.length < 2) {
      showError("nome", "Informe nome e sobrenome.");
      isValid = false;
    } else {
      showError("nome", "");
    }

    if (!emailIsValid) {
      showError("email", "Informe um email válido.");
      isValid = false;
    } else {
      showError("email", "");
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      showError("telefone", "Informe um telefone com DDD.");
      isValid = false;
    } else {
      showError("telefone", "");
    }

    return isValid;
  };

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      const area = digits.slice(0, 2);
      const firstPart = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
      const secondPart = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);

      if (digits.length <= 2) {
        phoneInput.value = area ? `(${area}` : "";
      } else if (secondPart) {
        phoneInput.value = `(${area}) ${firstPart}-${secondPart}`;
      } else {
        phoneInput.value = `(${area}) ${firstPart}`;
      }
    });
  }

  Object.entries(fields).forEach(([fieldName, field]) => {
    field.addEventListener("blur", () => {
      validateLeadForm();
    });

    field.addEventListener("input", () => {
      showError(fieldName, "");
    });
  });

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateLeadForm()) {
      return;
    }

    const formData = new FormData(leadForm);
    const interests = formData.getAll("interesse");

    if (googleFormsIsConfigured()) {
      const submitButton = leadForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
      showStatus("", "");

      try {
        await submitToGoogleForms(formData, interests);
        leadForm.reset();
        showStatus("Contato enviado com sucesso. Em breve falaremos com você.", "success");
      } catch {
        showStatus("Não foi possível enviar agora. Tente novamente ou chame pelo WhatsApp.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar contato";
      }

      return;
    }

    const message = [
      "Olá, quero atendimento da Brilho de Sofie.",
      "",
      `Nome: ${formData.get("nome") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Telefone: ${formData.get("telefone") || ""}`,
      `Interesses: ${interests.length ? interests.join(", ") : "não informado"}`,
    ].join("\n");

    const phone = leadForm.dataset.whatsapp || "5511917562519";
    showStatus("Configuração do Google Forms pendente. Abrindo WhatsApp como alternativa.", "error");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });
}

if (siteHeader && menuToggle && mobileMenu) {
  const closeMenu = () => {
    siteHeader.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    siteHeader.classList.toggle("menu-open", !isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}
