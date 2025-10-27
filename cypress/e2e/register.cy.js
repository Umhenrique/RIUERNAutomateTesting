describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://repositorio.apps.uern.br/')
    cy.get('[data-test="login-menu"]').click();
    cy.get('[data-test="register"]').click();
    cy.get('#email').type('test@example.com');
    cy.get('#main-content button.ng-star-inserted').click();
  })
})