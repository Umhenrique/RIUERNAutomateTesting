describe('template spec', () => {
  before(function() {
    cy.log('Initializing MailSlurp');
    const apiKey = Cypress.env('MAILSLURP_API_KEY');
    if (!apiKey) {
      throw new Error('MAILSLURP_API_KEY not found in cypress.env.json');
    }

    Cypress.config('defaultCommandTimeout', 90000);

    Cypress.config('retries', {
      runMode: 2,
      openMode: 1
    });
  });

  it('Creating account by email', () => {
    cy.visit('https://repositorio.apps.uern.br/')
    cy.get('[data-test="login-menu"]').click();
    cy.get('[data-test="register"]').click();
    cy.wait(1000);

    cy.log('Creating new inbox...');
    cy.mailslurp()
      .then(mailslurp => mailslurp.createInbox())
      .then(inbox => {
        cy.log('Inbox created:', inbox.emailAddress);
        cy.wrap(inbox.id).as('inboxId');
        cy.wrap(inbox.emailAddress).as('emailAddress');
      })
      .then(() => {
        return cy.get('@emailAddress').then(email => {
          cy.get('#email').should('be.visible').type(email);
          cy.get('#main-content button.ng-star-inserted').click();
          return cy.get('@inboxId');
        });
      })
      .then($inboxId => {
        const inboxId = $inboxId;
        cy.log('Waiting for email for inbox:', inboxId);
        return cy.mailslurp().then(mailslurp => mailslurp.waitForLatestEmail(inboxId, 80000));
      })
      .then(email => {
        cy.log('Email received:', email.subject);
        cy.log('Email body (truncated):', (email.body || '').slice(0, 200));

        const linkPattern = /(https?:\/\/[^\s<>"]+)/g;
        const matches = (email.body || '').match(linkPattern) || [];

        if (!matches.length) {
          throw new Error('No verification link found in email body');
        }

        const verificationLink = matches[0];
        cy.log('Found verification link:', verificationLink);
        cy.visit(verificationLink);

        cy.wait(2000);
        cy.scrollTo('bottom', { duration: 1000 });
        cy.wait(1000);

        cy.get('body').then($body => {
          if ($body.find('#user-agreement-accept').length) {
            cy.get('#user-agreement-accept').should('be.visible').check();
          }
        });

        cy.wait(1000);
        cy.get('body').then($body => {
          if ($body.find('.cm-btn.cm-btn-success').length) {
            cy.get('.cm-btn.cm-btn-success').should('be.visible').click();
          }
        });

        cy.wait(1000);
        cy.get('body').then($body => {
          if ($body.find('#button-save').length) {
            cy.get('#button-save').should('be.visible').click();
          }
        });

        cy.scrollTo('top', { duration: 1000 });
        cy.wait(1000);

        cy.get('#firstName').should('be.visible').type('test');
        cy.get('#lastName').should('be.visible').type('automation');

        cy.get('#password').scrollIntoView({ duration: 1000 });
        cy.wait(500);
        cy.get('#password').should('be.visible').type('P@ssw0rd');
        cy.get('#passwordrepeat').should('be.visible').type('P@ssw0rd');

        cy.get('body').then($body => {
          const $btn = $body.find('button:contains("Registro Completo")');
          if ($btn.length) {
            cy.contains('button', 'Registro Completo').scrollIntoView().should('be.visible').click();
          }
        });

        cy.pause();
      });
  });

});