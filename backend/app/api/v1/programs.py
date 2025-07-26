from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List
from app.db.session import get_async_session
from app.db.models import Program
from app.db.schemas import ProgramCreate, ProgramRead

router = APIRouter()

@router.post("/", response_model=ProgramRead, status_code=status.HTTP_201_CREATED)
async def create_program(program: ProgramCreate, session: AsyncSession = Depends(get_async_session)):
    db_program = Program(**program.dict())
    session.add(db_program)
    await session.commit()
    await session.refresh(db_program)
    return db_program

@router.get("/{program_id}", response_model=ProgramRead)
async def get_program(program_id: int, session: AsyncSession = Depends(get_async_session)):
    program = await session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program

@router.get("/", response_model=List[ProgramRead])
async def list_programs(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Program))
    programs = result.scalars().all()
    return programs

@router.patch("/{program_id}", response_model=ProgramRead)
async def update_program(program_id: int, update_data: ProgramCreate, session: AsyncSession = Depends(get_async_session)):
    stmt = (
        update(Program)
        .where(Program.id == program_id)
        .values(**update_data.dict())
        .execution_options(synchronize_session="fetch")
    )
    result = await session.execute(stmt)
    await session.commit()
    program = await session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program

@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(program_id: int, session: AsyncSession = Depends(get_async_session)):
    stmt = delete(Program).where(Program.id == program_id)
    result = await session.execute(stmt)
    await session.commit()
    return None 