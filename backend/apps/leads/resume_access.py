"""Signed-URL access control for applicant resumes (PII).

Resumes are no longer exposed at a public /media/ path. Instead the admin-only
journal endpoints mint a short-lived signature bound to a single lead pk, and
``LeadResumeView`` releases the file only for a valid, unexpired token. This lets
the admin panel keep its plain ``<a href>`` download (no Bearer header on the
GET) while still requiring a prior authenticated staff request to obtain a link.
"""
from django.core import signing

RESUME_SALT = "leads.resume"
# A distinct salt so a resume token can never be replayed against the attachment
# endpoint (or vice-versa) even for the same lead pk.
ATTACHMENT_SALT = "leads.attachment"
# Links are also delivered to Telegram, where staff may open them days later, so
# the signature has to stay valid that long. Verification uses this same window.
RESUME_MAX_AGE = 60 * 60 * 24 * 7  # 7 days


def make_resume_token(lead_pk) -> str:
    return signing.dumps(lead_pk, salt=RESUME_SALT)


def verify_resume_token(token: str):
    """Return the signed lead pk, or raise signing.BadSignature."""
    return signing.loads(token or "", salt=RESUME_SALT, max_age=RESUME_MAX_AGE)


def signed_resume_url(request, lead):
    """Absolute, signature-protected URL for a lead's resume (or None)."""
    if not lead.resume:
        return None
    token = make_resume_token(lead.pk)
    path = f"/api/leads/journal/{lead.pk}/resume/?token={token}"
    return request.build_absolute_uri(path) if request else path


def make_attachment_token(lead_pk) -> str:
    return signing.dumps(lead_pk, salt=ATTACHMENT_SALT)


def verify_attachment_token(token: str):
    """Return the signed lead pk, or raise signing.BadSignature."""
    return signing.loads(token or "", salt=ATTACHMENT_SALT, max_age=RESUME_MAX_AGE)


def signed_attachment_url(request, lead):
    """Absolute, signature-protected URL for a lead's brief attachment (or None)."""
    if not lead.attachment:
        return None
    token = make_attachment_token(lead.pk)
    path = f"/api/leads/journal/{lead.pk}/attachment/?token={token}"
    return request.build_absolute_uri(path) if request else path
