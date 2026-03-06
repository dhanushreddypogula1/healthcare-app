"""initial schema

Revision ID: 001
Revises: 
Create Date: 2026-03-06

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "doctors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("specialization", sa.Text(), nullable=False),
        sa.Column("start_hour", sa.Integer(), nullable=False),
        sa.Column("end_hour", sa.Integer(), nullable=False),
    )
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("doctor_id", sa.Integer(), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_name", sa.Text(), nullable=False),
        sa.Column("slot", sa.TIMESTAMP(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("appointments")
    op.drop_table("doctors")
