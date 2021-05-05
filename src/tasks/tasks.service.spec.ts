import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser = { username: 'User', id: 12 };
const mockCreateTaskDto: CreateTaskDto = {
  description: 'Test',
  title: 'Test title',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
});

describe('Task service', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('Get all task from repository', async () => {
      taskRepository.getTasks.mockResolvedValue('aom');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some query',
      };

      const result = await tasksService.getTasks(filters, mockUser as User);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('aom');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne and succefuly retrive and return the task', async () => {
      const mockTask = {
        title: 'test',
        description: 'test',
      };
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.id, id: 1 },
      });
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should return a new task', async () => {
      taskRepository.createTask.mockResolvedValue({
        ...mockCreateTaskDto,
        userId: mockUser.id,
      });
      const result = await tasksService.create(mockCreateTaskDto, mockUser);
      expect(result.userId).toEqual(mockUser.id);
      expect(result).toHaveProperty('title', mockCreateTaskDto.title);
      expect(result).toHaveProperty(
        'description',
        mockCreateTaskDto.description,
      );
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockCreateTaskDto,
        mockUser,
      );
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.deteleTask() to delete task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalled();
    });

    it('throw an error as task could not be found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      expect(tasksService.deleteById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('updateTaskStatusById', () => {
    it('should update the status', async () => {
      tasksService.getTaskById = jest.fn();
      const mockTask = {
        title: 'test',
        description: 'test',
        id: 1,
        userId: mockUser.id,
        status: TaskStatus.OPEN,
        save: taskRepository.save,
      };
      tasksService.getTaskById.mockResolvedValue(mockTask);
      const result = await tasksService.updateTaskStatusById(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      const updatedMockTask = mockTask;
      updatedMockTask.status = TaskStatus.DONE;
      expect(result).toEqual(updatedMockTask);
    });
  });
});
