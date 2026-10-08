(function () {
    function bind(dialog) {
        if (!dialog || typeof dialog.showModal !== "function") return { open() {}, close() {} };
        const panel = dialog.querySelector(".modal-window");
        const closeButtons = dialog.querySelectorAll("[data-modal-close], .modal-close, .modal-footer .btn-secondary");

        function open() {
            if (dialog.open) return;
            dialog.showModal();
            document.body.classList.add("modal-open");
            dialog.querySelector("[data-modal-close], .modal-close")?.focus({ preventScroll: true });
        }

        function close() {
            if (dialog.open) dialog.close();
        }

        closeButtons.forEach(button => button.addEventListener("click", close));
        dialog.addEventListener("click", event => {
            if (event.target === dialog) close();
        });
        dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));

        return { open, close, dialog, panel };
    }

    window.Conecta21TicketModal = { bind };
})();
