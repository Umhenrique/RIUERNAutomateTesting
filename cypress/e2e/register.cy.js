describe('template spec', () => {
  it('Creating account by email', () => {
    cy.visit('https://repositorio.apps.uern.br/')
    cy.get('[data-test="login-menu"]').click();
    cy.get('[data-test="register"]').click();
    cy.wait(1000);
    cy.mailslurp()
      .then(mailslurp => mailslurp.createInbox())
      .then(inbox => {
        cy.wrap(inbox.id).as('inboxId');
        cy.wrap(inbox.emailAddress).as('emailAddress');
      });
    cy.then(function () {
      expect(this.emailAddress).to.exist;
      cy.get('#email').type(this.emailAddress);
    });
    cy.get('#main-content button.ng-star-inserted').click();
  });

  it("verify email received", () => {
    // Add verification steps here
  });
});